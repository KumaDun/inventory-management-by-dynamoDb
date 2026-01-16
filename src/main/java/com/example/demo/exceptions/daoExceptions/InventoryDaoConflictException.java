package com.example.demo.exceptions.daoExceptions;

public class InventoryDaoConflictException extends RuntimeException {
    public InventoryDaoConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}

