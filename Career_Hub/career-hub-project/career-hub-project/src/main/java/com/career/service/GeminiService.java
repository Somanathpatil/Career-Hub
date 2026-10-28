package com.career.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.career.exception.GeminiAuthException;
import com.career.exception.GeminiQuotaExceededException;
import com.google.genai.Client;
import com.google.genai.errors.ApiException;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.HttpOptions;
import com.google.genai.types.HttpRetryOptions;

@Service
public class GeminiService {

	private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

	private final Client client;

	@Value("${gemini.model:gemini-3.5-flash-lite}")
	private String model;

	// Fallback models when the primary model encounters quota limits
	private static final List<String> FALLBACK_MODELS = List.of("gemini-3.5-flash-lite", "gemini-flash-lite-latest",
			"gemini-3.8-flash");

	public GeminiService(@Value("${gemini.api-key}") String apiKey) {
		// Crucial: Set retry attempts to 1 (0 retries) to prevent the SDK from
		// sleeping for 4+ minutes when Google sends HTTP 429 retryDelay,
		// which was causing the 90000ms frontend timeout.
		HttpRetryOptions retryOptions = HttpRetryOptions.builder().attempts(1).build();

		HttpOptions httpOptions = HttpOptions.builder().timeout(20000) // 20s fast timeout instead of 90s hang
				.retryOptions(retryOptions).build();

		this.client = Client.builder().apiKey(apiKey).httpOptions(httpOptions).build();
	}

	public String generateCareerGuidance(String prompt) {
		ApiException lastApiException = null;

		// 1. Try with the configured primary model
		try {
			return executeModelCall(model, prompt);
		} catch (ApiException e) {
			lastApiException = e;
			log.warn("Gemini call failed on primary model '{}' (HTTP {}): {}", model, e.code(), e.message());

			// 2. If 429 (quota exhausted) or 404 (model deprecated), try fallback models
			if (e.code() == 429 || e.code() == 404) {
				for (String fallback : FALLBACK_MODELS) {
					if (fallback.equalsIgnoreCase(model))
						continue;
					try {
						log.info("Attempting Gemini fallback model: {}", fallback);
						return executeModelCall(fallback, prompt);
					} catch (ApiException fbEx) {
						lastApiException = fbEx;
						log.warn("Fallback model '{}' also failed (HTTP {}): {}", fallback, fbEx.code(),
								fbEx.message());
					} catch (Exception fbEx) {
						log.warn("Fallback model '{}' error: {}", fallback, fbEx.getMessage());
					}
				}
			}
		} catch (Exception e) {
			log.error("Unexpected error communicating with Gemini API: {}", e.getMessage(), e);
			throw new RuntimeException("Gemini Communication Error: " + e.getMessage(), e);
		}

		// 3. If all model attempts failed, translate the error into a clear, actionable
		// exception
		if (lastApiException != null) {
			throw translateGeminiException(lastApiException);
		}

		throw new RuntimeException("Gemini returned an empty response. Please try again.");
	}

	private String executeModelCall(String modelName, String prompt) {
		GenerateContentResponse response = client.models.generateContent(modelName, prompt, null);

		if (response == null) {
			throw new RuntimeException("Gemini response is null for model: " + modelName);
		}

		String result = response.text();

		if (result == null || result.isBlank()) {
			throw new RuntimeException("Gemini returned an empty text response for model: " + modelName);
		}

		return cleanGeminiResponse(result);
	}

	private String cleanGeminiResponse(String text) {
		return text
				// Remove Markdown heading symbols
				.replaceAll("(?m)^\\s{0,3}#{1,6}\\s*", "")

				// Convert bold text to readable plain text
				.replaceAll("\\*\\*(.*?)\\*\\*", "$1").replaceAll("__(.*?)__", "$1")

				// Remove italic markers
				.replaceAll("(?<!\\*)\\*([^*\\n]+)\\*(?!\\*)", "$1").replaceAll("(?<!_)_([^_\\n]+)_(?!_)", "$1")

				// Remove Markdown strikethrough markers
				.replaceAll("~~(.*?)~~", "$1")

				// Remove Markdown code markers
				.replace("```", "").replace("`", "")

				// Clean unnecessary whitespace
				.replaceAll("[ \\t]+\\n", "\n").replaceAll("\\n{3,}", "\n\n").trim();
	}

	private RuntimeException translateGeminiException(ApiException e) {
		int code = e.code();
		String msg = e.message() != null ? e.message() : "";

		// Check for Quota / Rate limit (HTTP 429)
		if (code == 429 || msg.toLowerCase().contains("quota") || msg.toLowerCase().contains("resource_exhausted")) {
			return new GeminiQuotaExceededException(
					"Gemini API Quota Exceeded (HTTP 429): You have reached your request limit on the Gemini Free Tier. "
							+ "Google error: " + cleanMessage(msg) + ". "
							+ "Please wait a few minutes or update your Gemini API key in application.yml.");
		}

		// Check for Invalid / Expired API Key (HTTP 401 or 403)
		if (code == 401 || code == 403 || msg.toLowerCase().contains("api_key")
				|| msg.toLowerCase().contains("permission_denied") || msg.toLowerCase().contains("unauthenticated")
				|| msg.toLowerCase().contains("invalid api key")) {
			return new GeminiAuthException("Gemini API Key Expired or Invalid (HTTP " + code
					+ "): The configured API key is unauthorized or has expired. "
					+ "Please generate a new API key from Google AI Studio (https://aistudio.google.com/) and update 'gemini.api-key' in application.yml.");
		}

		// Check for Model Not Found / Deprecated (HTTP 404)
		if (code == 404) {
			return new RuntimeException("Gemini Model Not Available (HTTP 404): " + cleanMessage(msg)
					+ ". Please check the 'gemini.model' setting in application.yml.");
		}

		return new RuntimeException("Gemini API Error (HTTP " + code + "): " + cleanMessage(msg), e);
	}

	private String cleanMessage(String raw) {
		if (raw == null)
			return "Unknown error";
		return raw.replaceAll("\\s+", " ").trim();
	}
}
