# PRZIO Email API - Postman Documentation

This document provides comprehensive documentation for using the PRZIO Email Testing Tool API with Postman.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Importing the Collection](#importing-the-collection)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Request Examples](#request-examples)
6. [Response Examples](#response-examples)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

## Getting Started

### Prerequisites

- Postman installed on your computer
- A PRZIO account with a project
- An API key generated from your project settings

### Getting Your API Key

1. Log in to your PRZIO account
2. Navigate to your project settings
3. Go to the "API Keys" section
4. Click "Create API Key"
5. Copy the generated API key (starts with `przio_`)
6. Note your Project ID

## Importing the Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select the `PRZIO_API_Postman_Collection.json` file
4. The collection will be imported with all endpoints and examples

## Configuration

After importing, configure the collection variables:

1. Click on the **PRZIO Email API** collection
2. Go to the **Variables** tab
3. Set the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `baseUrl` | Your PRZIO instance URL | `http://localhost:3000` or `https://przio.com` |
| `apiKey` | Your API key | `przio_abc123...` |
| `projectId` | Your project ID | `507f1f77bcf86cd799439011` |
| `templateId` | Template ID (optional) | `507f1f77bcf86cd799439011` or `welcome-email-v1` |
| `emailSubject` | Default email subject | `Test Email from PRZIO API` |

## Authentication

PRZIO API uses API Key authentication with HTTP-only cookies.

### Step 1: Authenticate

1. Open the **Authentication** folder
2. Run the **"Authenticate with API Key"** request
3. This will set an HTTP-only cookie that will be used for subsequent requests

**Important:** Make sure Postman is configured to handle cookies:
- Go to Postman Settings → General
- Enable "Automatically follow redirects"
- Cookies are handled automatically by Postman

### Request Body

```json
{
    "apiKey": "przio_your_api_key_here",
    "projectId": "your_project_id_here"
}
```

### Success Response

```json
{
    "success": true,
    "message": "API key authenticated successfully",
    "project": {
        "id": "507f1f77bcf86cd799439011",
        "name": "My Project"
    },
    "user": {
        "id": "507f191e810c19729de860ea",
        "name": "John Doe",
        "email": "john@example.com"
    }
}
```

The authentication token is automatically stored in an HTTP-only cookie (`przio_api_token`) and will be sent with all subsequent requests.

## API Endpoints

### Send Bulk Emails

**Endpoint:** `POST /api/emails/send-bulk`

Send emails to multiple recipients using a template or custom HTML.

#### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `subject` | string | Yes | Email subject line |
| `recipients` | array | Yes | Array of recipient email addresses |
| `templateId` | string | No* | Template ID (MongoDB ObjectId or custom template ID) |
| `html` | string | No* | Custom HTML content |
| `smtpId` | string | No | SMTP configuration ID (uses project default if not provided) |
| `projectId` | string | Yes** | Project ID (required for API key auth) |

\* Either `templateId` or `html` must be provided (or project must have a default template)  
\** Required when using API key authentication

#### Template ID Formats

The `templateId` can be:
- **MongoDB ObjectId**: `507f1f77bcf86cd799439011` (24 hex characters)
- **Custom Template ID**: `welcome-email-v1` (any string you set in the template settings)

If you use a custom template ID, the API will search for templates by the `customTemplateId` field.

#### Request Examples

**1. Using Template ID (MongoDB ObjectId)**

```json
{
    "subject": "Welcome to PRZIO",
    "recipients": [
        "user1@example.com",
        "user2@example.com"
    ],
    "templateId": "507f1f77bcf86cd799439011",
    "projectId": "507f1f77bcf86cd799439011"
}
```

**2. Using Custom Template ID**

```json
{
    "subject": "Welcome Email",
    "recipients": ["user@example.com"],
    "templateId": "welcome-email-v1",
    "projectId": "507f1f77bcf86cd799439011"
}
```

**3. Using Custom HTML**

```json
{
    "subject": "Custom Email",
    "recipients": ["user@example.com"],
    "html": "<html><body><h1>Hello!</h1><p>This is a custom email.</p></body></html>",
    "smtpId": "507f1f77bcf86cd799439012",
    "projectId": "507f1f77bcf86cd799439011"
}
```

**4. Using Project Defaults**

```json
{
    "subject": "Newsletter",
    "recipients": ["user@example.com"],
    "projectId": "507f1f77bcf86cd799439011"
}
```

This will use the project's default template and SMTP settings.

#### Success Response

```json
{
    "message": "Emails sent: 2, Failed: 0",
    "sent": 2,
    "failed": 0,
    "total": 2,
    "errors": [],
    "progress": {
        "sent": 2,
        "pending": 0,
        "failed": 0,
        "total": 2
    }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Summary message |
| `sent` | number | Number of successfully sent emails |
| `failed` | number | Number of failed emails |
| `total` | number | Total number of recipients |
| `errors` | array | Array of error messages (first 10) |
| `progress` | object | Detailed progress information |

## Error Handling

### Common Error Responses

#### 401 Unauthorized

```json
{
    "error": "Unauthorized"
}
```

**Causes:**
- Not authenticated (run the authentication request first)
- Invalid or expired API key
- Missing authentication cookie

**Solution:** Run the "Authenticate with API Key" request again.

#### 400 Bad Request

**Missing Required Fields**

```json
{
    "error": "Missing required fields: subject, recipients"
}
```

**No Template or HTML**

```json
{
    "error": "Either html or templateId is required"
}
```

**Solution:** Ensure all required fields are provided and either `templateId` or `html` is included.

#### 403 Forbidden

**Project ID Mismatch**

```json
{
    "error": "Project ID mismatch"
}
```

**Solution:** Ensure the `projectId` in your request matches the project associated with your API key.

#### 404 Not Found

**Template Not Found**

```json
{
    "error": "Template not found"
}
```

**SMTP Not Found**

```json
{
    "error": "SMTP configuration not found"
}
```

**Solution:** Verify that the template ID or SMTP ID exists in your project.

#### 500 Internal Server Error

```json
{
    "error": "Server error"
}
```

**Solution:** Check the server logs or contact support.

## Best Practices

### 1. Authentication

- Always authenticate first before making API calls
- The authentication cookie is valid for 30 days
- Re-authenticate if you receive 401 errors

### 2. Template IDs

- Use custom template IDs for easier management (e.g., `welcome-email-v1`)
- Custom template IDs must be unique within a project
- You can set custom template IDs in the template settings

### 3. Email Sending

- Emails are sent in batches of 10 with 1-second delays
- For large recipient lists, the API handles batching automatically
- Monitor the `errors` array in the response for failed sends

### 4. Error Handling

- Always check the `failed` count in the response
- Review the `errors` array for specific failure reasons
- Implement retry logic for failed emails if needed

### 5. Rate Limiting

- The API sends emails in batches to avoid overwhelming SMTP servers
- There's a 1-second delay between batches
- For very large lists, consider splitting into multiple requests

### 6. Security

- Never commit API keys to version control
- Use environment variables or Postman variables for sensitive data
- Rotate API keys regularly
- Use different API keys for different environments (dev, staging, production)

## Testing Workflow

1. **Set Collection Variables**
   - Configure `baseUrl`, `apiKey`, and `projectId`

2. **Authenticate**
   - Run "Authenticate with API Key" request
   - Verify successful authentication

3. **Send Test Email**
   - Use "Send Bulk Emails" request
   - Start with a single recipient
   - Verify email is received

4. **Scale Up**
   - Test with multiple recipients
   - Test with different templates
   - Test error scenarios

## Troubleshooting

### Cookies Not Working

If authentication isn't persisting:

1. Check Postman settings → General → Enable cookies
2. Make sure you're using the same domain for all requests
3. Try clearing cookies and re-authenticating

### Template Not Found

- Verify the template ID is correct
- Check if the template belongs to the correct project
- For custom template IDs, ensure they're set in template settings

### Emails Not Sending

- Check SMTP configuration is correct
- Verify SMTP credentials are valid
- Check the `errors` array in the response for specific issues
- Ensure recipients are valid email addresses

## Support

For additional help:
- Check the PRZIO documentation
- Review API response error messages
- Contact PRZIO support

## Changelog

### Version 1.0.0
- Initial API documentation
- Support for API key authentication
- Support for template-based and custom HTML emails
- Support for custom template IDs



