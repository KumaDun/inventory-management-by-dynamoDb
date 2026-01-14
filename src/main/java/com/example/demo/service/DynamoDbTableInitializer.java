package com.example.demo.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.List;

@Service
@Profile("!test") // disable initializing tables in test
public class DynamoDbTableInitializer {
    private final DynamoDbClient dynamoDbClient;
    private final String itemsTableName;
    private final String ordersTableName;

    @Autowired
    public DynamoDbTableInitializer(DynamoDbClient dynamoDbClient,
                                    @Value("${dynamodb.inventory.table.itemsTable.name}") String itemsTableName,
                                    @Value("${dynamodb.inventory.table.ordersTable.name}") String ordersTableName) {
        this.dynamoDbClient = dynamoDbClient;
        this.itemsTableName = itemsTableName;
        this.ordersTableName = ordersTableName;
    }

    @PostConstruct
    public void createItemsTableIfNotExists() {
        List<String> existing_Tables = dynamoDbClient.listTables().tableNames();
        if (existing_Tables.contains(itemsTableName)) {
            System.out.println(itemsTableName + " is found in dynamoDb, no need to create new one.");
        } else {
            dynamoDbClient.createTable(
                    CreateTableRequest.builder()
                            .tableName(itemsTableName)
                            .keySchema(
                                    KeySchemaElement.builder()
                                            .attributeName("itemId")
                                            .keyType(KeyType.HASH)
                                            .build()
                            )
                            .attributeDefinitions(
                                    AttributeDefinition.builder()
                                            .attributeName("itemId")
                                            .attributeType(ScalarAttributeType.S)
                                            .build()
                            )
                            .billingMode(BillingMode.PAY_PER_REQUEST)
                            .build()
            );
        }
    }

    @PostConstruct
    public void createOrdersTableIfNotExists() {
        List<String> existing_Tables = dynamoDbClient.listTables().tableNames();
        if (existing_Tables.contains(ordersTableName)) {
            System.out.println(ordersTableName + " is found in dynamoDb, no need to create new one.");
        } else {
            dynamoDbClient.createTable(
                    CreateTableRequest.builder()
                            .tableName(ordersTableName)
                            .keySchema(
                                    KeySchemaElement.builder()
                                            .attributeName("customerId")
                                            .keyType(KeyType.HASH)
                                            .build(),
                                    KeySchemaElement.builder()
                                            .attributeName("orderTime")
                                            .keyType(KeyType.RANGE)
                                            .build()
                            )
                            .attributeDefinitions(
                                    AttributeDefinition.builder()
                                            .attributeName("customerId")
                                            .attributeType(ScalarAttributeType.S)
                                            .build(),
                                    AttributeDefinition.builder()
                                            .attributeName("orderTime")
                                            .attributeType(ScalarAttributeType.S)
                                            .build(),
                                    AttributeDefinition.builder()
                                            .attributeName("orderId")
                                            .attributeType(ScalarAttributeType.S)
                                            .build()
                            )
                            .globalSecondaryIndexes(
                                    GlobalSecondaryIndex.builder()
                                            .indexName("orderIdIndex")
                                            .keySchema(
                                                    KeySchemaElement.builder()
                                                            .attributeName("orderId")
                                                            .keyType(KeyType.HASH)
                                                            .build()
                                            )
                                            .projection(Projection.builder()
                                                    .projectionType(ProjectionType.ALL)
                                                    .build()
                                            )
                                            .build()
                            )
                            .billingMode(BillingMode.PAY_PER_REQUEST)
                            .build()
            );
        }
    }
}
