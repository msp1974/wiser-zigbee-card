export const is_preview = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let root: any = document.querySelector("home-assistant");
  root = root && root.shadowRoot;
  root = root && root.querySelector("hui-dialog-edit-card");
  root = root && root.shadowRoot;
  root = root && root.querySelector("ha-dialog");
  root = root && root.querySelector("hui-card-preview");
  //root = root && root.querySelector("wiser-zigbee-card");
  if (root) {
    return true;
  }
  return false;
};
