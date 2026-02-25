package com.example.demo.service;

import com.example.demo.dao.ItemsRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;
import software.amazon.awssdk.services.dynamodb.waiters.DynamoDbWaiter;

import java.util.List;
import java.util.concurrent.TimeoutException;

@Service
@Profile("!test") // disable initializing tables in test
public class DynamoDbTableInitializer {
    private final DynamoDbClient dynamoDbClient;
    private final ItemsRepository itemsRepository;
    private final String itemsTableName;
    private final String ordersTableName;

    @Autowired
    public DynamoDbTableInitializer(DynamoDbClient dynamoDbClient,
                                    ItemsRepository itemsRepository,
                                    @Value("${dynamodb.inventory.table.itemsTable.name}") String itemsTableName,
                                    @Value("${dynamodb.inventory.table.ordersTable.name}") String ordersTableName) {
        this.dynamoDbClient = dynamoDbClient;
        this.itemsRepository = itemsRepository;
        this.itemsTableName = itemsTableName;
        this.ordersTableName = ordersTableName;
    }

    @PostConstruct
    public void initItemsTable() {
        createItemsTableIfNotExists();
        try {
            waitUntilTableActive(itemsTableName);
        } catch (TimeoutException e) {
            throw new RuntimeException(e);
        }
        createIndex(itemsTableName, "category", "name");
        int updatedRows = itemsRepository.backfillMissingShardKeys(100);
        System.out.println("Backfilled shardKey for " + updatedRows + " inventory items.");
        createIndex(itemsTableName, "shardKey", "name");
    }

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

    private void waitUntilTableActive(String tableName) throws TimeoutException {
        DynamoDbWaiter waiter = dynamoDbClient.waiter();
        waiter.waitUntilTableExists(DescribeTableRequest.builder()
                .tableName(tableName)
                .build());
        int timeConsumed = 0;
        while (true) {
            TableStatus status = dynamoDbClient.describeTable(
                    DescribeTableRequest.builder().tableName(tableName).build()
            ).table().tableStatus();

            if (status == TableStatus.ACTIVE) {
                return;
            }
            if (timeConsumed > 100000) {
                throw new TimeoutException("Interrupted because dynamoDb operation costs over 10 seconds");
            }
            try {
                timeConsumed += 2000;
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Interrupted while waiting for table to become ACTIVE", e);
            }
        }
    }

    public void createIndex(String itemsTableName, String pkName, String skName) {
        final String gsiName = pkName + "-" + skName + "-index";
        DescribeTableResponse describeTableResponse = dynamoDbClient.describeTable(DescribeTableRequest.builder().tableName(itemsTableName).build());
        List<GlobalSecondaryIndexDescription> gsis = describeTableResponse.table().globalSecondaryIndexes();
        if (gsis != null && gsis.stream().anyMatch(gsi -> gsi.indexName().equals(gsiName))) {
            System.out.println(gsiName + "already exists on " + itemsTableName);
            return;
        }
        UpdateTableRequest request = UpdateTableRequest.builder()
                .tableName(itemsTableName)
                .attributeDefinitions(
                        AttributeDefinition.builder()
                                .attributeName(pkName)
                                .attributeType(ScalarAttributeType.S)
                                .build(),
                        AttributeDefinition.builder()
                                .attributeName(skName)
                                .attributeType(ScalarAttributeType.S)
                                .build()
                )
                .globalSecondaryIndexUpdates(
                        GlobalSecondaryIndexUpdate.builder()
                                .create(CreateGlobalSecondaryIndexAction.builder()
                                        .indexName(gsiName)
                                        .keySchema(
                                                KeySchemaElement.builder()
                                                        .attributeName(pkName)
                                                        .keyType(KeyType.HASH)
                                                        .build(),
                                                KeySchemaElement.builder()
                                                        .attributeName(skName)
                                                        .keyType(KeyType.RANGE)
                                                        .build()
                                        )
                                        .projection(Projection.builder()
                                                .projectionType(ProjectionType.ALL)
                                                .build())
                                        .build()
                                )
                                .build()
                )
                .build();
        dynamoDbClient.updateTable(request);
        try {
            waitUntilTableActive(itemsTableName);
        } catch (TimeoutException e) {
            throw new RuntimeException(e);
        }
        System.out.println("Creating GSI " + gsiName + " on " + itemsTableName + ".");
    }
}
