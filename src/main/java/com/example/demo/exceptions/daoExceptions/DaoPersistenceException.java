package com.example.demo.exceptions.daoExceptions;

public class DaoPersistenceException extends RuntimeException {
    public DaoPersistenceException(String message, Throwable cause) {
        super(message, cause);
    }
}

