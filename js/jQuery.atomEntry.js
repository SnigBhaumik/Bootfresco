
var atomentryheader = "<?xml version='1.0' encoding='utf-8'?><entry xmlns=\"http://www.w3.org/2005/Atom\" xmlns:app=\"http://www.w3.org/2007/app\" xmlns:cmis=\"http://docs.oasis-open.org/ns/cmis/core/200908/\" xmlns:cmisra=\"http://docs.oasis-open.org/ns/cmis/restatom/200908/\" xmlns:alf=\"http://www.alfresco.org\">";
var atomentryfooter = "</entry>";

$.atomEntry = function(options) {

	options = $.extend ({
		baseTypeId: null,
		objectTypeId: null,
		name: null,
		title: null,
		summary: null,
		description: null,
		contenttype: null,
		content: null

    }, options);

	return new entryObject(options);
	
};

function entryObject (options) {
	this.constructPacket(options);
}

entryObject.prototype = {

	entryXML: '',

	constructPacket: function (options) {
		var xml = "";
		xml += atomentryheader;
		if (options.name)			xml += "<title>" + options.name + "</title>";
		if (options.summary)		xml += "<summary>" + options.summary + "</summary>";
		if (options.content)		xml += "<content type=\"" + options.contenttype + "\">" + options.content + "</content>";

		xml += "<cmisra:object><cmis:properties>";
		if (options.objectTypeId)	xml += "<cmis:propertyId propertyDefinitionId=\"cmis:objectTypeId\"><cmis:value>" + options.objectTypeId + "</cmis:value></cmis:propertyId>";
		if (options.baseTypeId)		xml += "<cmis:propertyId propertyDefinitionId=\"cmis:baseTypeId\"><cmis:value>" + options.baseTypeId + "</cmis:value></cmis:propertyId>";
		if (options.name)			xml += "<cmis:propertyString propertyDefinitionId=\"cmis:name\"><cmis:value>" + options.name + "</cmis:value></cmis:propertyString>";

		xml += "<alf:setAspects>";
		xml += "<alf:appliedAspects>P:cm:titled</alf:appliedAspects>";
		xml += "<alf:properties>";
		if (options.title)			xml += "<cmis:propertyString propertyDefinitionId=\"cm:title\" displayName=\"Title\" queryName=\"cm:title\"><cmis:value>" + options.title + "</cmis:value></cmis:propertyString>";
		if (options.description)	xml += "<cmis:propertyString propertyDefinitionId=\"cm:description\"><cmis:value>" + options.description + "</cmis:value></cmis:propertyString>";
		xml += "</alf:properties></alf:setAspects>";

		xml += "</cmis:properties></cmisra:object>";

		xml += atomentryfooter;
		this.entryXML = xml;
		return xml;
	}
}
