import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, isConfigured } from './config.js';
import { listMessages, getMessage, sendMessage, updateMessage, deleteMessage } from './api.js';

const program = new Command();

function printSuccess(message) { console.log(chalk.green('✓') + ' ' + message); }
function printError(message) { console.error(chalk.red('✗') + ' ' + message); }
function printJson(data) { console.log(JSON.stringify(data, null, 2)); }

function printTable(data, columns) {
  if (!data || data.length === 0) { console.log(chalk.yellow('No results found.')); return; }
  const widths = {};
  columns.forEach(col => {
    widths[col.key] = col.label.length;
    data.forEach(row => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      if (val.length > widths[col.key]) widths[col.key] = val.length;
    });
    widths[col.key] = Math.min(widths[col.key], 40);
  });
  const header = columns.map(col => col.label.padEnd(widths[col.key])).join('  ');
  console.log(chalk.bold(chalk.cyan(header)));
  console.log(chalk.dim('─'.repeat(header.length)));
  data.forEach(row => {
    const line = columns.map(col => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      return val.substring(0, widths[col.key]).padEnd(widths[col.key]);
    }).join('  ');
    console.log(line);
  });
  console.log(chalk.dim(`\n${data.length} result(s)`));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try { const result = await fn(); spinner.stop(); return result; }
  catch (error) { spinner.stop(); throw error; }
}

function requireAuth() {
  if (!isConfigured()) {
    printError('API credentials not configured.');
    console.log('\nRun the following to configure:');
    console.log(chalk.cyan('  apideckcomsms config set --api-key <key> --app-id <id>'));
    process.exit(1);
  }
}

program.name('apideckcomsms').description(chalk.bold('Apideck SMS CLI') + ' - Unified SMS API from your terminal').version('1.0.0');

const configCmd = program.command('config').description('Manage CLI configuration');
configCmd.command('set')
  .description('Set configuration values')
  .option('--api-key <key>', 'Apideck API key')
  .option('--app-id <id>', 'Apideck App ID')
  .option('--consumer-id <id>', 'Consumer ID')
  .action((options) => {
    if (options.apiKey) { setConfig('apiKey', options.apiKey); printSuccess('API key set'); }
    if (options.appId) { setConfig('appId', options.appId); printSuccess('App ID set'); }
    if (options.consumerId) { setConfig('consumerId', options.consumerId); printSuccess('Consumer ID set'); }
    if (!options.apiKey && !options.appId && !options.consumerId) {
      printError('No options provided. Use --api-key, --app-id, or --consumer-id');
    }
  });

configCmd.command('show').description('Show current configuration').action(() => {
  const apiKey = getConfig('apiKey');
  const appId = getConfig('appId');
  const consumerId = getConfig('consumerId');
  console.log(chalk.bold('\nApideck SMS CLI Configuration\n'));
  console.log('API Key:     ', apiKey ? chalk.green('*'.repeat(16)) : chalk.red('not set'));
  console.log('App ID:      ', appId ? chalk.green(appId) : chalk.red('not set'));
  console.log('Consumer ID: ', consumerId ? chalk.green(consumerId) : chalk.yellow('not set (using default)'));
  console.log('');
});

const messagesCmd = program.command('messages').description('Manage SMS messages');
messagesCmd.command('list').description('List SMS messages').option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const result = await withSpinner('Fetching messages...', () => listMessages());
      const messages = result.data || result;
      if (options.json) { printJson(messages); return; }
      printTable(messages, [
        { key: 'id', label: 'ID', format: (v) => v?.substring(0, 8) + '...' || 'N/A' },
        { key: 'from', label: 'From' },
        { key: 'to', label: 'To' },
        { key: 'body', label: 'Message' },
        { key: 'status', label: 'Status' }
      ]);
    } catch (error) { printError(error.message); process.exit(1); }
  });

messagesCmd.command('get <message-id>').description('Get a specific message').option('--json', 'Output as JSON')
  .action(async (messageId, options) => {
    requireAuth();
    try {
      const result = await withSpinner('Fetching message...', () => getMessage(messageId));
      const message = result.data || result;
      if (options.json) { printJson(message); return; }
      console.log(chalk.bold('\nMessage Details\n'));
      console.log('ID:      ', chalk.cyan(message.id));
      console.log('From:    ', message.from || 'N/A');
      console.log('To:      ', message.to || 'N/A');
      console.log('Body:    ', message.body || 'N/A');
      console.log('Status:  ', message.status || 'N/A');
    } catch (error) { printError(error.message); process.exit(1); }
  });

messagesCmd.command('send').description('Send an SMS message')
  .requiredOption('--to <number>', 'Recipient phone number')
  .requiredOption('--body <text>', 'Message body')
  .option('--from <number>', 'Sender phone number')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const messageData = { to: options.to, body: options.body };
      if (options.from) messageData.from = options.from;
      const result = await withSpinner('Sending message...', () => sendMessage(messageData));
      const message = result.data || result;
      if (options.json) { printJson(message); return; }
      printSuccess('Message sent successfully');
      console.log('Message ID: ', chalk.cyan(message.id || 'N/A'));
    } catch (error) { printError(error.message); process.exit(1); }
  });

messagesCmd.command('delete <message-id>').description('Delete a message')
  .action(async (messageId) => {
    requireAuth();
    try {
      await withSpinner('Deleting message...', () => deleteMessage(messageId));
      printSuccess('Message deleted');
    } catch (error) { printError(error.message); process.exit(1); }
  });

program.parse(process.argv);
if (process.argv.length <= 2) { program.help(); }
