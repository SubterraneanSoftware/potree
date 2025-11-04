

import {MeasurePanel} from "./MeasurePanel.js";

export class PointPanel extends MeasurePanel{
	constructor(viewer, measurement, propertiesPanel){
		super(viewer, measurement, propertiesPanel);

		let removeIconPath = Potree.resourcePath + '/icons/remove.svg';
		this.elContent = $(`
			<div class="measurement_content selectable">
				<span class="coordinates_table_container"></span>
				<br>
				<span class="attributes_table_container"></span>

				<!-- ACTIONS -->
				<div style="display: flex; margin-top: 12px">
					<span></span>
					<span style="flex-grow: 1"></span>
					<img name="remove" class="button-icon" src="${removeIconPath}" style="width: 16px; height: 16px"/>
				</div>
			</div>
		`);

		this.elRemove = this.elContent.find("img[name=remove]");
		this.elRemove.click( () => {
			this.viewer.scene.removeMeasurement(measurement);
		});

		this.propertiesPanel.addVolatileListener(measurement, "marker_added", this._update);
		this.propertiesPanel.addVolatileListener(measurement, "marker_removed", this._update);
		this.propertiesPanel.addVolatileListener(measurement, "marker_moved", this._update);

		this.update();
	}

	update(){
		let elCoordiantesContainer = this.elContent.find('.coordinates_table_container');
		elCoordiantesContainer.empty();
		elCoordiantesContainer.append(this.createCoordinatesTable(this.measurement.points.map(p => p.position)));

		let vector3 = this.measurement.points.map(p => p.position)
		elCoordiantesContainer.append('<div><a href="https://google.com/maps/place/ '+this.convertCoords(vector3[0].x, vector3[0].y, vector3[0].z)+'"target="_blank"><Button>Show on Google Maps</Button></a><div>');

		let elAttributesContainer = this.elContent.find('.attributes_table_container');
		elAttributesContainer.empty();
		elAttributesContainer.append(this.createAttributesTable());
	}

	convertCoords(x, y, z) {
		const irishGrid = "+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +ellps=airy +towgs84=478.8,-125.3,564.6,-1.042,-0.214,-0.631,8.15 +units=m +no_defs";
		const britishGrid = "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs +towgs84=446.448,-125.157,542.060,-0.1502,-0.2470,-0.8421,20.4894";
		const utm30N = "+proj=utm +zone=30 +datum=WGS84 +units=m +no_defs +geoidgrids=egm96_15.gsf";
		const aberdeenGrid = "+proj=utm +zone=30 +datum=WGS84 +units=m +no_defs +geoidgrids=egm96_16.gsf";
		const irishGridAlternative = "+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +towgs84=482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15 +units=m +no_defs";

		// Define the WGS84 projection
		const wgs84 = "+proj=longlat +datum=WGS84 +no_defs";

		var systemToUse = utm30N;
		if (this.viewer.getCoordSystem() == "BritishGrid") {
			systemToUse = britishGrid;
		}
		else if (this.viewer.getCoordSystem() == "IrishGrid") {
			systemToUse = irishGrid;
		}
		else if (this.viewer.getCoordSystem() == "AberdeenGrid") {
			systemToUse = aberdeenGrid;
		}
		else if (this.viewer.getCoordSystem() == "IrishGridAlt") {
			systemToUse = irishGridAlternative;
		}
	
		// Use proj4 to transform the coordinates, including height
		const coords = proj4(systemToUse, wgs84, [x, y, z]);
	
		return coords[1] + ',' + coords[0]
	}
};