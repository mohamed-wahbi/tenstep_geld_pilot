import { Version } from "@microsoft/sp-core-library";
import { IPropertyPaneConfiguration } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import * as React from "react";
import * as ReactDom from "react-dom";
import AnnualActivities from "./components/AnnualActivities";


export default class AnnualActivitiesWebPart extends BaseClientSideWebPart<{}> {
  public render(): void {
    const element: React.ReactElement = React.createElement(AnnualActivities);
    ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0"); 
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [],
    };
  }
} 