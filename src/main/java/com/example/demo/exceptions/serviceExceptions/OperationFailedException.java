package com.example.demo.exceptions.serviceExceptions;

public class OperationFailedException extends RuntimeException{
    public OperationFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
