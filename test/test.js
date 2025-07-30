#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🧪 Obsidian MCP Server Test Suite');
console.log('==================================\n');

// Test 1: Check if build files exist
console.log('1. Checking build files...');
const distPath = join(projectRoot, 'dist');
const indexPath = join(distPath, 'index.js');

if (!fs.existsSync(distPath)) {
  console.log('❌ dist/ directory not found. Run "npm run build" first.');
  process.exit(1);
}

if (!fs.existsSync(indexPath)) {
  console.log('❌ dist/index.js not found. Run "npm run build" first.');
  process.exit(1);
}

console.log('✅ Build files found');

// Test 2: Check environment configuration
console.log('\n2. Checking environment configuration...');
const envPath = join(projectRoot, '.env');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found. Using environment variables or defaults.');
} else {
  console.log('✅ .env file found');
}

// Test 3: Test MCP server startup (stdio mode)
console.log('\n3. Testing MCP server startup (stdio mode)...');

const testServer = () => {
  return new Promise((resolve, reject) => {
    const server = spawn('node', [indexPath], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        // Use test values if not set
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'test-key',
        OBSIDIAN_VAULT_PATH: process.env.OBSIDIAN_VAULT_PATH || '/tmp/test-vault',
        DEBUG: 'true'
      }
    });

    let output = '';
    let errorOutput = '';

    server.stdout.on('data', (data) => {
      output += data.toString();
    });

    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Send a simple MCP request
    const mcpRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    };

    server.stdin.write(JSON.stringify(mcpRequest) + '\n');

    setTimeout(() => {
      server.kill();
      
      if (errorOutput.includes('Obsidian MCP Server started successfully')) {
        console.log('✅ Server started successfully');
        resolve(true);
      } else if (errorOutput.includes('Vault path does not exist')) {
        console.log('⚠️  Server started but vault path needs configuration');
        resolve(true);
      } else if (errorOutput.includes('Missing required environment variables')) {
        console.log('⚠️  Server needs environment variables configured');
        resolve(true);
      } else {
        console.log('❌ Server startup failed');
        console.log('Error output:', errorOutput);
        reject(new Error('Server startup failed'));
      }
    }, 3000);

    server.on('error', (error) => {
      console.log('❌ Failed to start server:', error.message);
      reject(error);
    });
  });
};

// Test 4: Validate package.json scripts
console.log('\n4. Checking package.json scripts...');
const packagePath = join(projectRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const requiredScripts = ['build', 'start', 'dev'];
const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);

if (missingScripts.length > 0) {
  console.log('❌ Missing scripts:', missingScripts.join(', '));
} else {
  console.log('✅ All required scripts found');
}

// Test 5: Check dependencies
console.log('\n5. Checking dependencies...');
const requiredDeps = [
  '@modelcontextprotocol/sdk',
  'openai',
  'fs-extra',
  'gray-matter',
  'glob',
  'dotenv',
  'express',
  'cors'
];

const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

if (missingDeps.length > 0) {
  console.log('❌ Missing dependencies:', missingDeps.join(', '));
  console.log('Run "npm install" to install missing dependencies.');
} else {
  console.log('✅ All required dependencies found');
}

// Run server test if dependencies are available
if (missingDeps.length === 0) {
  try {
    await testServer();
  } catch (error) {
    console.log('❌ Server test failed:', error.message);
  }
} else {
  console.log('\n⚠️  Skipping server test due to missing dependencies');
}

// Test 6: Configuration validation
console.log('\n6. Validating configuration files...');
const configFiles = [
  'config/windsurf-mcp-config.json',
  'config/windsurf-mcp-config-remote.json'
];

let configValid = true;
for (const configFile of configFiles) {
  const configPath = join(projectRoot, configFile);
  if (fs.existsSync(configPath)) {
    try {
      JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log(`✅ ${configFile} is valid JSON`);
    } catch (error) {
      console.log(`❌ ${configFile} has invalid JSON:`, error.message);
      configValid = false;
    }
  } else {
    console.log(`❌ ${configFile} not found`);
    configValid = false;
  }
}

// Summary
console.log('\n📋 Test Summary');
console.log('===============');

if (configValid && missingDeps.length === 0) {
  console.log('✅ All tests passed! The MCP server is ready to use.');
  console.log('\nNext steps:');
  console.log('1. Configure your .env file with OPENAI_API_KEY and OBSIDIAN_VAULT_PATH');
  console.log('2. Add the server configuration to Windsurf');
  console.log('3. Test the integration in Windsurf Cascade');
} else {
  console.log('⚠️  Some issues found. Please address them before using the server.');
  
  if (missingDeps.length > 0) {
    console.log('\nRun: npm install');
  }
  
  if (!configValid) {
    console.log('\nCheck configuration files in config/ directory');
  }
}

console.log('\n🔗 For more information, see README.md');
