// Ace ships types at its package root, while the browser entry is a subpath.
declare module "ace-builds/src-noconflict/ace" {
  import ace from "ace-builds";
  export default ace;
}
