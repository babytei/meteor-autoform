/**
 * @constructor
 * @private
 * @param {String} migrationName
 *
 * Internal helper object to preserve form inputs across Hot Code Push
 * and across "pages" navigation if the option is enabled.
 */
FormPreserve = function formPreserveConstructor(migrationName) {
  var self = this;
  if (! _.isString(migrationName))
    throw Error("You must define an unique migration name of type String");
  self.registeredForms = {};
  self.retrievedDocuments = {};
  if (Package.reload) {
    var Reload = Package.reload.Reload;
    self.retrievedDocuments = Reload._migrationData(migrationName) || {};
    Reload._onMigrate(migrationName, function () {
      return [true, self._retrieveRegisteredDocuments()];
    });
  }
};

FormPreserve.prototype.getDocument = function (formId) {
  var self = this;
  if (! _.has(self.retrievedDocuments, formId))
    return false;
  else
    return self.retrievedDocuments[formId];
};

FormPreserve.prototype.clearDocument = function (formId) {
  delete this.retrievedDocuments[formId];
};

FormPreserve.prototype.registerForm = function (formId, retrieveFunc) {
  this.registeredForms[formId] = retrieveFunc;
};

FormPreserve.prototype.formIsRegistered = function (formId) {
  return !!this.registeredForms[formId];
};

FormPreserve.prototype.unregisterForm = function (formId) {
  delete this.registeredForms[formId];
  delete this.retrievedDocuments[formId];
};

FormPreserve.prototype.unregisterAllForms = function () {
  var self = this;
  self.registeredForms = {};
  self.retrievedDocuments = {};
};

FormPreserve.prototype._retrieveRegisteredDocuments = function () {
  var self = this;
  res = {};
  _.each(self.registeredForms, function (retrieveFunc, formId) {
    res[formId] = retrieveFunc();
  });
  return res;
};
