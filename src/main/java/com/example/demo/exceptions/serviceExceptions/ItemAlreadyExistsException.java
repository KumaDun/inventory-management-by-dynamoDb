package com.example.demo.exceptions.serviceExceptions;

public class ItemAlreadyExistsException extends RuntimeException{
    public ItemAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}
