package com.example.demo.exceptions.serviceExceptions;

public class InventoryOperationFailedException extends RuntimeException{
    public InventoryOperationFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
