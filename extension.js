// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "osc-blog-publish" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "osc-blog-publish.helloWorld",
    function () {
      // The code you place here will be executed every time your command is executed

      // 读取配置
      const cookie = vscode.workspace
        .getConfiguration()
        .get("osc-blog-publish.cookie");
      console.log("cookie: ", cookie);
      // 修改配置
      // vscode.workspace.getConfiguration().update('vscodePluginDemo.yourName', '前端艺术家', true);

      // Display a message box to the user
      vscode.window.showInformationMessage(
        "Hello World from osc-blog-publish asasasas!" + cookie
      );
    }
  );

  context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
