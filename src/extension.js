const vscode = require("vscode");
const publish = require("./util");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "publish-osc-blog" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "publish-osc-blog.publish",
    async function ({ fsPath }) {
      let { code } = await publish(fsPath);
      // The code you place here will be executed every time your command is executed
      if (code === 1) {
        vscode.window.showInformationMessage("发布成功");
      } else {
        vscode.window.showErrorMessage("发布失败");
      }
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
