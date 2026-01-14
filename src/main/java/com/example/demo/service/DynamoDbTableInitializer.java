package com.example.demo.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.List;

@Service
public class DynamoDbTableInitializer {
    private final DynamoDbClient dynamoDbClient;
    private final String tableName;

    @Autowired
    public DynamoDbTableInitializer(DynamoDbClient dynamoDbClient, @Value("${dynamodb.inventory.table.name}") String tableName) {
        this.dynamoDbClient = dynamoDbClient;
        this.tableName = tableName;
    }

    @PostConstruct
    public void createTableIfNotExists() {
        List<String> existing_Tables = dynamoDbClient.listTables().tableNames();
        if (existing_Tables.contains(tableName)) {
            System.out.println(tableName + " is found in dynamoDb, no need to create new one.");
        } else {
            dynamoDbClient.createTable(
                    CreateTableRequest.builder()
                            .tableName(tableName)
                            .keySchema(
                                    KeySchemaElement.builder()
                                            .attributeName("id")
                                            .keyType(KeyType.HASH)
                                            .build()
                            )
                            .attributeDefinitions(
                                    AttributeDefinition.builder()
                                            .attributeName("id")
                                            .attributeType(ScalarAttributeType.S)
                                            .build()
                            )
                            .billingMode(BillingMode.PAY_PER_REQUEST)
                            .build()
            );
        }
    }
}
