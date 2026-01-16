package com.example.demo.exceptions.daoExceptions;

public class InventoryDaoPersistenceException extends RuntimeException {
    public InventoryDaoPersistenceException(String message, Throwable cause) {
        super(message, cause);
    }
}

