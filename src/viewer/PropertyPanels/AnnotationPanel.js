
import {Utils} from "../../utils.js";

export class AnnotationPanel{
	constructor(viewer, propertiesPanel, annotation){
		this.viewer = viewer;
		this.propertiesPanel = propertiesPanel;
		this.annotation = annotation;

		this._update = () => { this.update(); };

		let copyIconPath = `${Potree.resourcePath}/icons/copy.svg`;
		let removeIconPath = Potree.resourcePath + '/icons/remove.svg';

		this.elContent = $(`
		<div class="propertypanel_content">
			<table>
				<tr>
					<th colspan="3">position</th>
					<th></th>
				</tr>
				<tr>
					<td align="center" id="annotation_position_x" style="width: 25%"></td>
					<td align="center" id="annotation_position_y" style="width: 25%"></td>
					<td align="center" id="annotation_position_z" style="width: 25%"></td>
					<td align="right" id="copy_annotation_position" style="width: 25%">
						<img name="copyPosition" title="copy" class="button-icon" src="${copyIconPath}" style="width: 16px; height: 16px"/>
					</td>
				</tr>
				<tr>
					<td colspan="4" align="center">
						<div id="annotation_gps_position"></div>
					</td>
				</tr>

			</table>

			<div>

				<div class="heading">Title</div>
				<div id="annotation_title" contenteditable="true">
					Annotation Title
				</div>

				<div class="heading">Description</div>
				<div id="annotation_description">
					A longer description of this annotation. 
						Can be multiple lines long. TODO: the user should be able
						to modify title and description. 
				</div>

			</div>

			<!-- ACTIONS -->
			<div style="display: flex; margin-top: 12px">
				<span></span>
				<span style="flex-grow: 1"></span>
				<img name="remove" class="button-icon" src="${removeIconPath}" style="width: 16px; height: 16px"/>
			</div>

		</div>
		`);

		this.elCopyPosition = this.elContent.find("img[name=copyPosition]");
		this.elCopyPosition.click( () => {
			let pos = this.annotation.position.toArray();
			let msg = pos.map(c => c.toFixed(3)).join(", ");
			Utils.clipboardCopy(msg);

			this.viewer.postMessage(
					`Copied value to clipboard: <br>'${msg}'`,
					{duration: 3000});
		});

		this.elRemove = this.elContent.find("img[name=remove]");
		this.elRemove.click( () => {
			this.viewer.scene.removeAnnotation(annotation);
		});

		this.elTitle = this.elContent.find("#annotation_title").html(annotation.title);
		this.elDescription = this.elContent.find("#annotation_description").html(annotation.description);


		let vector3 = this.annotation.position.toArray();
		console.log(vector3);
		this.elGPSPosition = this.elContent.find("#annotation_gps_position").html('<a href="https://google.com/maps/place/ '+this.convertCoords(vector3[0], vector3[1], vector3[2])+'"target="_blank"><Button>Show on Google Maps</Button></a>');

		this.elTitle[0].addEventListener("input", () => {
			const title = this.elTitle.html();
			annotation.title = title;

		}, false);

		this.elDescription[0].addEventListener("input", () => {
			const description = this.elDescription.html();
			annotation.description = description;
		}, false);

		this.update();
	}

	update(){
		const {annotation, elContent, elTitle, elDescription} = this;

		let pos = annotation.position.toArray().map(c => Utils.addCommas(c.toFixed(3)));
		elContent.find("#annotation_position_x").html(pos[0]);
		elContent.find("#annotation_position_y").html(pos[1]);
		elContent.find("#annotation_position_z").html(pos[2]);

		elTitle.html(annotation.title);
		elDescription.html(annotation.description);
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