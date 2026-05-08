const { NodeSSH } = require("node-ssh");
const ssh = new NodeSSH();

async function ejecutar(comando) {
    await ssh.connect({
        host: "192.168.100.20", // CAMBIAR
        username: "dvcun",
        password: "12345"
    });

    const result = await ssh.execCommand(comando);

    return result.stdout;
}

module.exports = { ejecutar };