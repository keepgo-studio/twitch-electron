import { LitElement } from "lit";
import { getLangJson } from "./functions";

export class ViewCore extends LitElement {
  public langJson: PlayerLangMap;

  constructor() {
    super();
    this.langJson = getLangJson();
  }
}