package com.example.demo.service;

import com.example.demo.dao.OrderRepository;
import com.example.demo.exceptions.daoExceptions.DaoConflictException;
import com.example.demo.exceptions.daoExceptions.DaoPersistenceException;
import com.example.demo.exceptions.serviceExceptions.OperationFailedException;
import com.example.demo.exceptions.serviceExceptions.ItemConflictException;
import com.example.demo.model.OrderItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    private final OrderRepository orderRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public void putItem(OrderItem orderItem) {
        try {
            orderRepository.putItem(orderItem);
        } catch (DaoConflictException ex) {
            String message = String.format("putOrder with customer %s and orderTime %s already exists or condition check failed",
                    orderItem.getCustomerId(), orderItem.getOrderTime());
            throw new ItemConflictException(message, ex);
        } catch (DaoPersistenceException ex) {
            throw new OperationFailedException("OrderItem database failure (putItem), please try later", ex);
        }
    }

    public Optional<OrderItem> getOrderByCustomerIdAndOrderTimes(String customerId, String orderTime) {
        try {
            return orderRepository.getOrderByCustomerIdAndOrderTime(customerId, orderTime);
        } catch (DaoConflictException ex) {
            String message = String.format("getOrder with customer %s and orderTime %s condition check failed",
                    customerId, orderTime);
            throw new ItemConflictException(message, ex);
        } catch (DaoPersistenceException ex) {
            throw new OperationFailedException("OrderItem database failure (putItem), please try later", ex);
        }
    }

    public List<Optional<OrderItem>> getOrdersByCustomerId(String customerId) {
        try {
            return orderRepository.getOrdersByCustomerId(customerId);
        } catch (DaoConflictException ex) {
            String message = String.format("getOrder with customer %s condition check failed",
                    customerId);
            throw new ItemConflictException(message, ex);
        } catch (DaoPersistenceException ex) {
            throw new OperationFailedException("OrderItem database failure (getOrderByCustomerId), please try later", ex);
        }
    }

    public void deleteItem(OrderItem orderItem) {
        try {
            orderRepository.deleteItem(orderItem);
        } catch (DaoConflictException ex) {
            String message = String.format("deleteOrder with customer %s and orderTime %s condition check failed",
                    orderItem.getCustomerId(), orderItem.getOrderTime());
            throw new ItemConflictException(message, ex);
        } catch (DaoPersistenceException ex) {
            throw new OperationFailedException("OrderItem database failure (deleteItem), please try later", ex);
        }
    }

    public void deleteItemByCustomerId(String customerId) {
        try {
            orderRepository.deleteItemByCustomerId(customerId);
        } catch (DaoConflictException ex) {
            String message = String.format("deleteOrder with customer %s condition check failed",
                    customerId);
            throw new ItemConflictException(message, ex);
        } catch (DaoPersistenceException ex) {
            throw new OperationFailedException("OrderItem database failure (deleteItemWithCustomerId), please try later", ex);
        }
    }

    public void deleteItemByCustomerIdAndOrderTime(String customerId, String orderTime) {
        try {
            orderRepository.deleteItemByCustomerIdAndOrderTime(customerId, orderTime);
        } catch (DaoConflictException ex) {
            String message = String.format("deleteOrder with customer %s and customerId %s condition check failed",
                    customerId, customerId);
            throw new ItemConflictException(message, ex);
        } catch (DaoPersistenceException ex) {
            throw new OperationFailedException("OrderItem database failure (deleteItemWithCustomerId), please try later", ex);
        }
    }

}
