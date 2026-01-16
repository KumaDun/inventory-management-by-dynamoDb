package com.example.demo.exceptions.serviceExceptions;

public class ItemConflictException extends RuntimeException{
    public ItemConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
