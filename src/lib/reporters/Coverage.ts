import Reporter, { ReporterProperties } from './Reporter';
import { CoverageMap, createCoverageMap } from 'istanbul-lib-coverage';
import { createContext, summarizers, Watermarks } from 'istanbul-lib-report';
import { create, ReportType } from 'istanbul-reports';
import Node from '../executors/Node';

export default abstract class Coverage extends Reporter implements CoverageProperties {
	executor: Node;
	filename: string;
	watermarks: Watermarks;

	createCoverageReport(type: ReportType, data: object | CoverageMap) {
		let map: CoverageMap;

		if (isCoverageMap(data)) {
			map = data;
		}
		else {
			map = createCoverageMap(data);
		}

		const transformed = this.executor.sourceMapStore.transformCoverage(map);

		const context = createContext();
		const tree = summarizers.pkg(transformed.map);
		tree.visit(create(type, {
			file: this.filename || null,
			watermarks: this.watermarks
		}), context);
	}
}

export interface CoverageProperties extends ReporterProperties {
	filename: string;
	watermarks: Watermarks;
}

export type CoverageOptions = Partial<CoverageProperties>;

function isCoverageMap(value: any): value is CoverageMap {
	return value != null && typeof value.files === 'function';
}
