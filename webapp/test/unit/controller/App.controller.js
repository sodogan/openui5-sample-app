sap.ui.define(
	[
		"sap/ui/base/ManagedObject",
		"sap/ui/core/mvc/Controller",
		"sap/ui/demo/todo/controller/App.controller",
		"sap/ui/model/json/JSONModel",
		"sap/base/Log",
	],
	function (ManagedObject, Controller, AppController, JSONModel, Log) {
		"use strict";

		QUnit.module("Test model modification", {
			beforeEach: function () {
				this.oAppController = new AppController();
				this.oViewStub = new ManagedObject({});
				sinon
					.stub(Controller.prototype, "getView")
					.returns(this.oViewStub);

				this.oJSONModelStub = new JSONModel({
					todos: [],
				});
				this.oViewStub.setModel(this.oJSONModelStub);
				Log.info(
					"setting up before each" +
						JSON.stringify(this.oViewStub.getModel().oData)
				);
			},

			afterEach: function () {
				Log.info("setting up aftereach");

				Controller.prototype.getView.restore();

				this.oViewStub.destroy();
			},
		});

		QUnit.test("ById is called once", function (assert) {
			//Given
			var _oAppController = new AppController();
			var _stub = sinon.stub(Controller.prototype, "byId").returns(12);
			//When
			var _actual = _oAppController.byId("test");
			//Then
			assert.strictEqual(_actual, 12);

			//Make sure that spy is called!
			assert.ok(_stub.called, "Make sure that stub is called");

			//Then-check its called once!
			sinon.assert.calledOnce(_stub);
			//check that
			assert.ok(_stub.calledWith("test"), "Check the arg");
		});

		QUnit.test("Should add a todo element to the model", function (assert) {
			// Arrange
			// initial assumption: to-do list is empty
			assert.strictEqual(
				this.oJSONModelStub.getObject("/todos").length,
				0,
				"There must be no todos defined."
			);

			// Act
			this.oJSONModelStub.setProperty("/newTodo", "new todo item");
			this.oAppController.addTodo();

			// Assumption
			assert.strictEqual(
				this.oJSONModelStub.getObject("/todos").length,
				1,
				"There is one new item."
			);
		});

		QUnit.test(
			"Should toggle the completed items in the model",
			function (assert) {
				// Arrange
				var oModelData = {
					todos: [
						{
							title: "Start this app",
							completed: false,
						},
					],
					itemsLeftCount: 1,
				};
				this.oJSONModelStub.setData(oModelData);

				// initial assumption
				assert.strictEqual(
					this.oJSONModelStub.getObject("/todos").length,
					1,
					"There is one item."
				);
				assert.strictEqual(
					this.oJSONModelStub.getProperty("/itemsLeftCount"),
					1,
					"There is one item left."
				);

				// Act
				this.oJSONModelStub.setProperty("/todos/0/completed", true);
				this.oAppController.updateItemsLeftCount();

				// Assumption
				assert.strictEqual(
					this.oJSONModelStub.getProperty("/itemsLeftCount"),
					0,
					"There is no item left."
				);
			}
		);

		QUnit.test("Should clear the completed items", function (assert) {
			// Arrange
			var oModelData = {
				todos: [
					{
						title: "Start this app1",
						completed: false,
					},
					{
						title: "Start this app2",
						completed: true,
					},
				],
				itemsLeftCount: 1,
			};
			this.oJSONModelStub.setData(oModelData);

			// initial assumption
			assert.strictEqual(
				this.oJSONModelStub.getObject("/todos").length,
				2,
				"There are two items."
			);
			assert.strictEqual(
				this.oJSONModelStub.getProperty("/itemsLeftCount"),
				1,
				"There is no item left."
			);

			// Act
			this.oAppController.clearCompleted();
			this.oAppController.updateItemsLeftCount();

			// Assumption
			assert.strictEqual(
				this.oJSONModelStub.getObject("/todos").length,
				1,
				"There is one item left."
			);
			assert.strictEqual(
				this.oJSONModelStub.getProperty("/itemsLeftCount"),
				1,
				"There is one item left."
			);
		});

		QUnit.test(
			"Should update items left count when no todos are loaded, yet",
			function (assert) {
				// Arrange
				var oModelData = {};
				this.oJSONModelStub.setData(oModelData);

				// initial assumption
				assert.strictEqual(
					this.oJSONModelStub.getObject("/todos"),
					undefined,
					"There are no items."
				);
				assert.strictEqual(
					this.oJSONModelStub.getProperty("/itemsLeftCount"),
					undefined,
					"Items left is not set"
				);

				// Act
				this.oAppController.updateItemsLeftCount();

				// Assumption
				assert.strictEqual(
					this.oJSONModelStub.getProperty("/itemsLeftCount"),
					0,
					"There is no item left."
				);
			}
		);
	}
);
