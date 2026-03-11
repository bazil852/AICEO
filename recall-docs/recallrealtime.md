List Realtime Endpoints

# List Realtime Endpoints

The base rate limit for this endpoint is:
- 60 requests per min per workspace

# OpenAPI definition

```json
{
  "openapi": "3.0.3",
  "info": {
    "title": "Recall.ai API",
    "version": "0.0.0",
    "description": "Recall.ai API Documentation"
  },
  "paths": {
    "/api/v1/realtime_endpoint/": {
      "get": {
        "operationId": "realtime_endpoint_list",
        "summary": "List Realtime Endpoints",
        "parameters": [
          {
            "in": "query",
            "name": "created_at_after",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "in": "query",
            "name": "created_at_before",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "cursor",
            "required": false,
            "in": "query",
            "description": "The pagination cursor value.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "recording_id",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "in": "query",
            "name": "status_code",
            "schema": {
              "type": "string",
              "enum": [
                "done",
                "failed",
                "running"
              ]
            },
            "description": "* `running` - Running\n* `done` - Done\n* `failed` - Failed"
          },
          {
            "in": "query",
            "name": "type",
            "schema": {
              "type": "string",
              "enum": [
                "desktop_sdk_callback",
                "rtmp",
                "webhook",
                "websocket"
              ]
            },
            "description": "* `rtmp` - Rtmp\n* `websocket` - Websocket\n* `webhook` - Webhook\n* `desktop_sdk_callback` - Desktop Sdk Callback"
          }
        ],
        "tags": [
          "realtime_endpoint"
        ],
        "security": [
          {
            "tokenAuth": []
          }
        ],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PaginatedRealtimeEndpointList"
                }
              }
            },
            "description": ""
          }
        },
        "x-throttles": [
          {
            "scope_key": "workspace_id",
            "limit": 60,
            "period": "min"
          }
        ],
        "description": "The base rate limit for this endpoint is:\n- 60 requests per min per workspace"
      }
    }
  },
  "components": {
    "schemas": {
      "PaginatedRealtimeEndpointList": {
        "type": "object",
        "properties": {
          "next": {
            "type": "string",
            "nullable": true
          },
          "previous": {
            "type": "string",
            "nullable": true
          },
          "results": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/RealtimeEndpoint"
            }
          }
        }
      },
      "RealtimeEndpoint": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "readOnly": true
          },
          "created_at": {
            "type": "string",
            "format": "date-time",
            "readOnly": true
          },
          "recording": {
            "allOf": [
              {
                "$ref": "#/components/schemas/RecordingMinimal"
              }
            ],
            "readOnly": true
          },
          "metadata": {
            "type": "object",
            "additionalProperties": {
              "type": "string"
            }
          },
          "type": {
            "type": "string",
            "readOnly": true
          },
          "status": {
            "allOf": [
              {
                "$ref": "#/components/schemas/RealtimeEndpointStatus"
              }
            ],
            "readOnly": true
          },
          "url": {
            "type": "string",
            "format": "uri",
            "readOnly": true
          },
          "events": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "readOnly": true
          }
        },
        "required": [
          "created_at",
          "events",
          "id",
          "metadata",
          "recording",
          "status",
          "type",
          "url"
        ]
      },
      "RealtimeEndpointStatus": {
        "type": "object",
        "properties": {
          "code": {
            "$ref": "#/components/schemas/RealtimeEndpointStatusCodeEnum"
          },
          "sub_code": {
            "type": "string",
            "nullable": true
          },
          "updated_at": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": [
          "code",
          "sub_code",
          "updated_at"
        ]
      },
      "RealtimeEndpointStatusCodeEnum": {
        "enum": [
          "running",
          "done",
          "failed",
          "deleted"
        ],
        "type": "string",
        "description": "* `running` - Running\n* `done` - Done\n* `failed` - Failed\n* `deleted` - Deleted"
      },
      "RecordingMinimal": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "readOnly": true
          },
          "metadata": {
            "type": "object",
            "additionalProperties": {
              "type": "string",
              "nullable": true
            },
            "nullable": true
          }
        },
        "required": [
          "id",
          "metadata"
        ]
      }
    },
    "securitySchemes": {
      "tokenAuth": {
        "type": "apiKey",
        "in": "header",
        "name": "Authorization",
        "description": "Token-based authentication with required prefix \"Token\""
      }
    }
  },
  "servers": [
    {
      "url": "https://us-east-1.recall.ai",
      "description": "Recall.ai API"
    },
    {
      "url": "https://eu-central-1.recall.ai",
      "description": "European Recall.ai API"
    },
    {
      "url": "https://ap-northeast-1.recall.ai",
      "description": "Asia Recall.ai API"
    },
    {
      "url": "https://us-west-2.recall.ai",
      "description": "Pay-as-you-go Recall.ai API"
    }
  ]
}
```