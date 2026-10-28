package com.career.exception;

public class GeminiAuthException extends RuntimeException {

    public GeminiAuthException(String message) {
        super(message);
    }

    public GeminiAuthException(String message, Throwable cause) {
        super(message, cause);
    }
}
