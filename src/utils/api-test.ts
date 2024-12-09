import fetch from 'node-fetch';

interface OpenAPISchema {
  paths: Record<string, unknown>;
}

function isOpenAPISchema(data: unknown): data is OpenAPISchema {
  return typeof data === 'object' && data !== null && 'paths' in data;
}

async function testBackendConnection() {
  const baseUrl = 'https://fastapi-backend-production-2f5e.up.railway.app';

  try {
    // Test the root endpoint
    console.log('Testing root endpoint...');
    try {
      const rootResponse = await fetch(baseUrl + '/');
      const rootData = await rootResponse.json();
      console.log('Root endpoint response:', rootData);
    } catch (error: any) {
      console.log('Root endpoint error:', error.message);
    }

    // Test the docs endpoint
    console.log('\nTesting docs endpoint...');
    try {
      const docsResponse = await fetch(baseUrl + '/docs');
      console.log('Docs endpoint accessible:', docsResponse.status === 200);
      if (docsResponse.status === 200) {
        console.log('FastAPI Swagger documentation is available at:', baseUrl + '/docs');
      }
    } catch (error: any) {
      console.log('Docs endpoint error:', error.message);
    }

    // Test the OpenAPI schema endpoint
    console.log('\nTesting OpenAPI schema endpoint...');
    try {
      const schemaResponse = await fetch(baseUrl + '/openapi.json');
      if (schemaResponse.status === 200) {
        const schemaData = await schemaResponse.json();
        if (isOpenAPISchema(schemaData)) {
          console.log('Available endpoints:', Object.keys(schemaData.paths));
        } else {
          console.log('Invalid OpenAPI schema format');
        }
      } else {
        console.log('OpenAPI schema not available:', schemaResponse.status);
      }
    } catch (error: any) {
      console.log('Schema endpoint error:', error.message);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testBackendConnection(); 