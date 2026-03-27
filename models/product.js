import {
  PutCommand,
  GetCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/aws.js";
import { v4 as uuidv4 } from "uuid";

const TABLE_NAME = process.env.DYNAMO_TABLE;
const PRIMARY_KEY =
  process.env.DYNAMO_PRIMARY_KEY || process.env.DYNAMO_KEY || "id";

// QUAN TRỌNG NHẤT LÀ PRIMARY KEY PHẢI MAP VỚI BÊN DYNAMODB, không có là không đọc được chi tiết hoặc chỉnh sửa sản phẩm.
export default class Product {
  static async getAll() {
    const params = {
      TableName: TABLE_NAME,
    };

    const result = await docClient.send(new ScanCommand(params));
    const items = result.Items || [];
    return items.map((item) => ({ ...item, id: item[PRIMARY_KEY] }));
  }

  static async search(query) {
    const allProducts = await this.getAll();

    if (!query) return allProducts;

    const lowerQuery = query.toLowerCase();
    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        (product.price && product.price.toString().includes(query))
    );
  }

  static async getById(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { [PRIMARY_KEY]: id },
    };

    const result = await docClient.send(new GetCommand(params));
    if (!result.Item) return null;
    return { ...result.Item, id: result.Item[PRIMARY_KEY] };
  }

  static async create(productData) {
    const product = {
      ...productData,
      [PRIMARY_KEY]: uuidv4(),
      created_at: new Date().toISOString(),
    };

    const params = {
      TableName: TABLE_NAME,
      Item: product,
    };

    await docClient.send(new PutCommand(params));
    return product;
  }

  static async update(id, productData) {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(productData).forEach((key, index) => {
      updateExpressions.push(`#attr${index} = :val${index}`);
      expressionAttributeNames[`#attr${index}`] = key;
      expressionAttributeValues[`:val${index}`] = productData[key];
    });

    const params = {
      TableName: TABLE_NAME,
      Key: { [PRIMARY_KEY]: id },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    const result = await docClient.send(new UpdateCommand(params));
    return result.Attributes;
  }

  static async delete(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { [PRIMARY_KEY]: id },
    };

    await docClient.send(new DeleteCommand(params));
  }
}
