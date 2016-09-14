angular.module("SxcServices")
    .factory("appAssetsSvc", function($http, eavConfig, svcCreator) {

        // Construct a service for this specific appId
        return function createSvc(appId) {
            var svc = {
                appId: appId
            };

            // ReSharper disable once UseOfImplicitGlobalInFunctionScope
            svc = angular.extend(svc, svcCreator.implementLiveList(function getAll() {
                return $http.get("app/appassets/list", { params: { appId: svc.appId, withSubfolders: true } });
            }));

            svc.create = function create(path, content) {
                return $http.post("app/appassets/create", content || "", { params: { appId: svc.appId, path: path } })
                    .then(svc.liveListReload);
            };

            //// delete, then reload, for now must use httpget because delete sometimes causes issues
            //svc.delete = function del(id) {
            //    return $http.get("app/template/delete", {params: {appId: svc.appId, Id: id }})
            //        .then(svc.liveListReload);
            //};
            return svc;
        };
    });