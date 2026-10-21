import { createServerFn } from "@tanstack/react-start";
import { fetchPanelData, type PanelRow } from "./panel-data.server";

export type { PanelRow };

export const getPanelData = createServerFn({ method: "GET" }).handler(() => fetchPanelData());
