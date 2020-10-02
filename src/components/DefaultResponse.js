/**
 * @fileoverview Classe default de Retorno de Exception
 */
class DefaultResponse {

    /**
     * @param hasError  { Boolean } Se a response possui erro ou não.
     * @param data      { Object|String } O conteúdo da response.
     * @param name      { String } Nome da Response ou Exception E.g.: "UserException" da classe "User"
     * @param status    { Number } Código de retorno da response.
     */
    constructor(hasError, data, name, status) {
        this.hasError = hasError
        this.data = data
        this.name = name
        this.status = status
    }

    set hasError(hasError) {
        this._hasError = hasError
    }
    set data(data) {
        this._data = data
    }
    set name(name) {
        this._name = name
    }
    set status(status) {
        this._status = status
    }

    get hasError() {
        return this._hasError
    }
    get data() {
        return this._data
    }
    get name() {
        return this._name
    }
    get status() {
        return this._status
    }
}

module.exports = DefaultResponse