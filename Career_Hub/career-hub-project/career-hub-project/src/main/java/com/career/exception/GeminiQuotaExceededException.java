package com.career.exception;

public class GeminiQuotaExceededException extends RuntimeException {

    public GeminiQuotaExceededException(String message) {
        super(message);
    }

    public GeminiQuotaExceededException(String message, Throwable cause) {
        super(message, cause);
    }
}
