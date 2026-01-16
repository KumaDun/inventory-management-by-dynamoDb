package com.example.demo.exceptions.daoExceptions;

public class DaoConflictException extends RuntimeException {
    public DaoConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}

