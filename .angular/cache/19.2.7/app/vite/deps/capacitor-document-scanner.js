import {
  registerPlugin
} from "./chunk-4E4IEXPE.js";
import "./chunk-ZVATTXSA.js";

// node_modules/capacitor-document-scanner/dist/esm/definitions.js
var ResponseType;
(function(ResponseType2) {
  ResponseType2["Base64"] = "base64";
  ResponseType2["ImageFilePath"] = "imageFilePath";
})(ResponseType || (ResponseType = {}));
var ScanDocumentResponseStatus;
(function(ScanDocumentResponseStatus2) {
  ScanDocumentResponseStatus2["Success"] = "success";
  ScanDocumentResponseStatus2["Cancel"] = "cancel";
})(ScanDocumentResponseStatus || (ScanDocumentResponseStatus = {}));

// node_modules/capacitor-document-scanner/dist/esm/index.js
var DocumentScanner = registerPlugin("DocumentScanner", {
  web: () => import("./web-GMZLYRLK.js").then((m) => new m.DocumentScannerWeb())
});
export {
  DocumentScanner,
  ResponseType,
  ScanDocumentResponseStatus
};
//# sourceMappingURL=capacitor-document-scanner.js.map
