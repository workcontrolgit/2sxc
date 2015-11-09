﻿
(function () {
	"use strict";

	/* This app registers all field templates for 2sxc in the angularjs sxcFieldTemplates app */

	angular.module("sxcFieldTemplates")

    .config(function (formlyConfigProvider) {

		formlyConfigProvider.setType({
			name: "hyperlink-default",
			templateUrl: "fieldtemplates/templates/hyperlink-default.html",
			wrapper: ["eavLabel", "bootstrapHasError", "eavLocalization"],
			controller: "FieldTemplate-HyperlinkCtrl as vm"
		});
        
	})

	.controller("FieldTemplate-HyperlinkCtrl", function ($modal, $scope, $http, sxc) {

		var vm = this;
		vm.modalInstance = null;
		vm.testLink = "";
		vm.checkImgRegEx = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpg|jpeg|gif|png))(?:\?([^#]*))?(?:#(.*))?/i;

		vm.isImage = function () {
		    var value = $scope.value;
		    return vm.checkImgRegEx.test(vm.testLink);
		};
		vm.thumbnailUrl = function thumbnailUrl(size) {
	        if (size === 1)
	            return vm.testLink + "?w=46&h=46&mode=crop";
	        if(size===2)
	            return vm.testLink + "?w=500&h=400&mode=max";
	    };

		vm.bridge = { 
			valueChanged: function(value, type) {
				$scope.$apply(function () {

					// Convert file path to file ID if type file is specified
					if (value) {
						$scope.value.Value = value;


						if (type === "file") {
					        var valueWithoutVersion = value.replace(/\?ver=[0-9\-]*$/gi, "");
					        $http.get("dnn/Hyperlink/GetFileByPath?relativePath=" + encodeURIComponent(valueWithoutVersion)).then(function (result) {
								if(result.data)
									$scope.value.Value = "File:" + result.data.FileId;
							});
						}
					}
					vm.modalInstance.close();
				});
			},
			params: {
			    Paths: $scope.to.settings.merged ? $scope.to.settings.merged.Paths : "",
			    FileFilter: $scope.to.settings.merged ? $scope.to.settings.merged.FileFilter : ""
			}
		};

		// Update test-link if necessary
		$scope.$watch("value.Value", function (newValue, oldValue) {
			if (!newValue)
				return;

			if (newValue.indexOf("File") !== -1 || newValue.indexOf("Page") !== -1) {
				$http.get("dnn/Hyperlink/ResolveHyperlink?hyperlink=" + encodeURIComponent(newValue)).then(function (result) {
					if(result.data)
						vm.testLink = result.data;
				});
			}
		});

		vm.openDialog = function (type, options) {

			var template = type === "pagepicker" ? "pagepicker" : "filemanager";
			vm.bridge.dialogType = type;
			vm.bridge.params.CurrentValue = $scope.value.Value;

			vm.modalInstance = $modal.open({
				templateUrl: "fieldtemplates/templates/hyperlink-default-" + template + ".html",
				resolve: {
					bridge: function() {
						return vm.bridge;
					}
				},
				controller: function($scope, bridge) {
					$scope.bridge = bridge;
				},
				windowClass: "sxc-dialog-filemanager"
			});
		};

	});


})();