/* jFeed : $ feed parser plugin
 * Copyright (C) 2007 Jean-François Hovinne - http://www.hovinne.com/
 * Dual licensed under the MIT (MIT-license.txt)
 * and GPL (GPL-license.txt) licenses.
 */

$.getFeed = function(options) {

    options = $.extend({

        url: null,
        data: null,
        cache: true,
        success: null,
        failure: null,
        error: null,
        global: true

    }, options);

    if (options.url) {
        
        if ($.isFunction(options.failure) && $.type(options.error)==='null') {
          // Handle legacy failure option
          options.error = function(xhr, msg, e){
            options.failure(msg, e);
          }
        } else if ($.type(options.failure) === $.type(options.error) === 'null') {
          // Default error behavior if failure & error both unspecified
          options.error = function(xhr, msg, e){
            window.console&&console.log('getFeed failed to load feed', xhr, msg, e);
          }
        }

        return $.ajax({
            type: 'GET',
            url: options.url,
            data: options.data,
            cache: options.cache,
            dataType: "xml",
            success: function(xml) {
                var feed = new JFeed(xml);
                if ($.isFunction(options.success)) options.success(feed);
            },
            error: options.error,
            global: options.global
        });
    }
};

function JFeed(xml) {
    if (xml) this.parse(xml);
}
;

JFeed.prototype = {

    type: '',
    version: '',
    title: '',
    link: '',
    description: '',
	resultCount: 0,
	startIndex: 0,
	pageLength: 0,

    parse: function(xml) {

        /*if ($.browser.msie) {
            var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.loadXML(xml);
            xml = xmlDoc;
        }*/

        if ($('channel', xml).length == 1) {

            this.type = 'rss';
            var feedClass = new JRss(xml);

        } else if ($('feed', xml).length == 1) {

            this.type = 'atom';
            var feedClass = new JAtom(xml);

        } else if ($('entry', xml).length == 1) {

            this.type = 'atomsingle';
            var feedClass = new JAtomSingle(xml);
        }

        if (feedClass) $.extend(this, feedClass);
    }
};

function JFeedItem() {};

JFeedItem.prototype = {

    title: '',
    link: '',
    description: '',
    updated: '',
    id: '',
	icon : '',
	download: '',

	cmisobject: null,
	cmistype: null
};

//////////////////////
function cmisType() {};
cmisType.prototype = {

	id: '',
	author: '',
	localName: '',
	localNamespace: '',
	displayName: '',
	queryName: '',
	description: '',
	baseId: '',
	creatable: '',
	fileable: '',
	queryable: '',
	properties: null,
	propertiesData: null

};


function cmisObject() {};
cmisObject.prototype = {

	name: '',
	baseTypeId: '',
	createdBy: '',
	creationDate: '',
	objectTypeId: '',
	objectId: '',
	parentId: '',
	lastModifiedBy: '',
	lastModificationDate: '',
	contentStreamLength: '',
	mimeType: '',
	webpreview: '',
	versionLabel: '',
	checkinComment: '',
	propertiesCMIS: null,
	propertiesDataCMIS: null,
	aspects: null,
	aspectsData: null,
	propertiesALF: null,
	propertiesDataALF: null,
	path: '',
	canDeleteObject: '',
	canUpdateProperties: '',
	canCreateDocument: '',
	canCreateFolder: '',
	canCreateRelationship: '',
	canMoveObject: '',
	canCreateRelationship: ''

};

function objectProperty() {};
objectProperty.prototype = {
	name: '',
	value: '',
	type: ''
};

function aspect() {};
aspect.prototype = {
	name: '',
	value: ''
};
//////////////////////


function JAtom(xml) {
    this._parse(xml);
};

JAtom.prototype = {
    
    _parse: function(xml) {
    
        var channel = $('feed', xml).eq(0);

        this.version = '1.0';
        this.title = $(channel).find('title:first').text();
        this.link = $(channel).find('link:first').attr('href');
        this.description = $(channel).find('subtitle:first').text();
        this.language = $(channel).attr('xml:lang');
        this.updated = $(channel).find('updated:first').text();
        this.resultCount = $(channel).find('opensearch\\:totalResults:first').text();
        this.startIndex = $(channel).find('opensearch\\:startIndex:first').text();
        this.pageLength = $(channel).find('opensearch\\:itemsPerPage:first').text();
        
        this.items = new Array();
        
        var feed = this;
        
        $('entry', xml).each( function() {
        
            var item = new JFeedItem();
            
            item.title = $(this).find('title').eq(0).text();
            item.link = $(this).find('link').eq(0).attr('href');
            item.description = $(this).find('summary').eq(0).text();
            item.updated = $(this).find('updated').eq(0).text();
            item.id = $(this).find('id').eq(0).text();
	        item.download = $(this).find('content').attr('src');
			item.icon = $(this).find('alf\\:icon').eq(0).text();

			var cobj = new cmisObject();
			cobj.name = $(this).find('*[propertyDefinitionId="cmis:name"]').eq(0).first().text();
	        cobj.mimeType = $(this).find('content').attr('type');
			cobj.createdBy = $(this).find('*[propertyDefinitionId="cmis:createdBy"]').eq(0).first().text();
			cobj.creationDate = $(this).find('*[propertyDefinitionId="cmis:creationDate"]').eq(0).first().text();
			cobj.lastModifiedBy = $(this).find('*[propertyDefinitionId="cmis:lastModifiedBy"]').eq(0).first().text();
			cobj.lastModificationDate = $(this).find('*[propertyDefinitionId="cmis:lastModificationDate"]').eq(0).first().text();
			cobj.objectTypeId = $(this).find('*[propertyDefinitionId="cmis:objectTypeId"]').eq(0).first().text();
			cobj.objectId = $(this).find('*[propertyDefinitionId="cmis:objectId"]').eq(0).first().text();
			cobj.baseTypeId = $(this).find('*[propertyDefinitionId="cmis:baseTypeId"]').eq(0).first().text();
			cobj.parentId = $(this).find('*[propertyDefinitionId="cmis:parentId"]').eq(0).first().text();
			cobj.path = $(this).find('*[propertyDefinitionId="cmis:path"]').eq(0).first().text();
			var v = $(this).find('*[propertyDefinitionId="cmis:versionLabel"]');
			if (v)
			{
				cobj.versionLabel = v.eq(0).first().text();
				cobj.checkinComment = $(this).find('*[propertyDefinitionId="cmis:checkinComment"]').eq(0).first().text();
			}
			cobj.contentStreamLength = $(this).find('*[propertyDefinitionId="cmis:contentStreamLength"]').eq(0).first().text();
			cobj.webpreview = $(this).find('*[cmisra\\:renditionKind="alf:webpreview"]').eq(0).attr("href");
			item.cmisobject = cobj;

			var ctyp = new cmisType();
			ctyp.id = $(this).find('cmisra\\:type').eq(0).find('cmis\\:id').eq(0).text();
			ctyp.localName = $(this).find('cmisra\\:type').eq(0).find('cmis\\:localName').eq(0).text();
			ctyp.localNamespace = $(this).find('cmisra\\:type').eq(0).find('cmis\\:localNamespace').eq(0).text();
			ctyp.displayName = $(this).find('cmisra\\:type').eq(0).find('cmis\\:displayName').eq(0).text();
			ctyp.queryName = $(this).find('cmisra\\:type').eq(0).find('cmis\\:queryName').eq(0).text();
			ctyp.description = $(this).find('cmisra\\:type').eq(0).find('cmis\\:description').eq(0).text();
			ctyp.baseId = $(this).find('cmisra\\:type').eq(0).find('cmis\\:baseId').eq(0).text();
			ctyp.creatable = $.toBoolean($(this).find('cmisra\\:type').eq(0).find('cmis\\:creatable').eq(0).text());
			ctyp.fileable = $.toBoolean($(this).find('cmisra\\:type').eq(0).find('cmis\\:fileable').eq(0).text());
			ctyp.queryable = $.toBoolean($(this).find('cmisra\\:type').eq(0).find('cmis\\:queryable').eq(0).text());
			item.cmistype = ctyp;
			
            feed.items.push(item);
        });
    }
};

function JRss(xml) {
    this._parse(xml);
};

JRss.prototype  = {
    
    _parse: function(xml) {
    
        if($('rss', xml).length == 0) this.version = '1.0';
        else this.version = $('rss', xml).eq(0).attr('version');

        var channel = $('channel', xml).eq(0);
    
        this.title = $(channel).find('title:first').text();
        this.link = $(channel).find('link:first').text();
        this.description = $(channel).find('description:first').text();
        this.language = $(channel).find('language:first').text();
        this.updated = $(channel).find('lastBuildDate:first').text();
    
        this.items = new Array();
        
        var feed = this;
        
        $('item', xml).each( function() {
        
            var item = new JFeedItem();
            
            item.title = $(this).find('title').eq(0).text();
            item.link = $(this).find('link').eq(0).text();
            item.description = $(this).find('description').eq(0).text();
            item.updated = $(this).find('pubDate').eq(0).text();
            item.id = $(this).find('guid').eq(0).text();
            
            feed.items.push(item);
        });
    }
};


function JAtomSingle(xml) {
    this._parse(xml);
};

JAtomSingle.prototype = {
    
    _parse: function(xml) {
    
        var entri = $('entry', xml).eq(0);

		this.version = '1.0';
        this.title = $(entri).find('title:first').text();
        this.link = $(entri).find('link:first').attr('href');
        this.updated = $(entri).find('updated:first').text();
        
        var item = new JFeedItem();
        
        var feed = this;
        
		item.title = $(entri).find('*[propertyDefinitionId="cm:title"]').eq(0).first().text();
		item.link = $(entri).find('link').eq(0).attr('href');
		item.description = $(entri).find('summary').eq(0).text();
		item.updated = $(entri).find('updated').eq(0).text();
		item.id = $(entri).find('id').eq(0).text();
        item.download = $(this).find('content').attr('src');

		item.icon = $(entri).find('alf\\:icon').eq(0).text();

		var cobj = new cmisObject();
		cobj.name = $(entri).find('*[propertyDefinitionId="cmis:name"]').eq(0).first().text();
        cobj.mimeType = $(entri).find('content').attr('type');
		cobj.createdBy = $(entri).find('*[propertyDefinitionId="cmis:createdBy"]').eq(0).first().text();
		cobj.creationDate = $(entri).find('*[propertyDefinitionId="cmis:creationDate"]').eq(0).first().text();
		cobj.lastModifiedBy = $(entri).find('*[propertyDefinitionId="cmis:lastModifiedBy"]').eq(0).first().text();
		cobj.lastModificationDate = $(entri).find('*[propertyDefinitionId="cmis:lastModificationDate"]').eq(0).first().text();
		cobj.objectTypeId = $(entri).find('*[propertyDefinitionId="cmis:objectTypeId"]').eq(0).first().text();
		cobj.objectId = $(entri).find('*[propertyDefinitionId="cmis:objectId"]').eq(0).first().text();
		cobj.baseTypeId = $(entri).find('*[propertyDefinitionId="cmis:baseTypeId"]').eq(0).first().text();
		cobj.parentId = $(entri).find('*[propertyDefinitionId="cmis:parentId"]').eq(0).first().text();
		cobj.path = encodeURIComponent($(entri).find('*[propertyDefinitionId="cmis:path"]').eq(0).first().text());
		var v = $(this).find('*[propertyDefinitionId="cmis:versionLabel"]');
		if (v)
		{
			cobj.versionLabel = v.eq(0).first().text();
			cobj.checkinComment = $(this).find('*[propertyDefinitionId="cmis:checkinComment"]').eq(0).first().text();
		}
		cobj.contentStreamLength = $(entri).find('*[propertyDefinitionId="cmis:contentStreamLength"]').eq(0).first().text();
		cobj.webpreview = $(entri).find('*[cmisra\\:renditionKind="alf:webpreview"]').eq(0).attr("href");
		
		cobj.propertiesCMIS = $(entri).find('cmisra\\:object').eq(0).find('cmis\\:properties').children();
		cobj.propertiesDataCMIS = new Array();
		for (var i=0; i<cobj.propertiesCMIS.length; i++ )
		{
			var p = new objectProperty();
			var x = cobj.propertiesCMIS[i];
			if (x.attributes["displayName"])
			{
				p.name = x.attributes["displayName"].nodeValue;
				p.value = x.firstChild ? x.firstChild.textContent : "";
				p.type = x.attributes["localName"] ? x.attributes["localName"].nodeValue : "";
				cobj.propertiesDataCMIS.push(p);
			}
		}

		cobj.aspects = $(entri).find('cmisra\\:object').eq(0).find('cmis\\:properties').eq(0).find('alf\\:aspects').eq(0).find('alf\\:appliedAspects');
		cobj.aspectsData = new Array();
		for (var i=0; i<cobj.aspects.length; i++ )
		{
			var a = new aspect();
			a.name = cobj.aspects[i].textContent;
			cobj.aspectsData.push(a);
		}

		cobj.propertiesALF = $(entri).find('cmisra\\:object').eq(0).find('cmis\\:properties').eq(0).find('alf\\:aspects').eq(0).find('alf\\:properties').children();
		cobj.propertiesDataALF = new Array();
		for (var i=0; i<cobj.propertiesALF.length; i++ )
		{
			var p = new objectProperty();
			var x = cobj.propertiesALF[i];
			if (x.attributes["displayName"])
			{
				p.name = x.attributes["displayName"].nodeValue;
				p.value = x.firstChild ? x.firstChild.textContent : "";
				p.type = x.attributes["localName"] ? x.attributes["localName"].nodeValue : "";
				cobj.propertiesDataALF.push(p);
			}
		}

		cobj.canDeleteObject = $.toBoolean($(entri).find('cmisra\\:object').eq(0).find('cmis\\:allowableActions').eq(0).find('cmis\\:canDeleteObject').eq(0).text());
		cobj.canUpdateProperties = $.toBoolean($(entri).find('cmisra\\:object').eq(0).find('cmis\\:allowableActions').eq(0).find('cmis\\:canUpdateProperties').eq(0).text());
		cobj.canCreateDocument = $.toBoolean($(entri).find('cmisra\\:object').eq(0).find('cmis\\:allowableActions').eq(0).find('cmis\\:canCreateDocument').eq(0).text());
		cobj.canCreateFolder = $.toBoolean($(entri).find('cmisra\\:object').eq(0).find('cmis\\:allowableActions').eq(0).find('cmis\\:canCreateFolder').eq(0).text());
		cobj.canMoveObject = $.toBoolean($(entri).find('cmisra\\:object').eq(0).find('cmis\\:allowableActions').eq(0).find('cmis\\:canMoveObject').eq(0).text());
		cobj.canCreateRelationship = $.toBoolean($(entri).find('cmisra\\:object').eq(0).find('cmis\\:allowableActions').eq(0).find('cmis\\:canCreateRelationship').eq(0).text());
		item.cmisobject = cobj;

		var ctyp = new cmisType();
		ctyp.author = $(entri).find('author').eq(0).find('name').eq(0).text();
		ctyp.id = $(entri).find('cmisra\\:type').eq(0).find('cmis\\:id').eq(0).text();
		ctyp.localName = $(entri).find('cmisra\\:type').eq(0).find('cmis\\:localName').eq(0).text();
		ctyp.localNamespace = $(entri).find('cmisra\\:type').eq(0).find('cmis\\:localNamespace').eq(0).text();
		ctyp.displayName = $(entri).find('cmisra\\:type').eq(0).find('cmis\\:displayName').eq(0).text();
		ctyp.queryName = $(entri).find('cmisra\\:type').eq(0).find('cmis\\:queryName').eq(0).text();
		ctyp.description = $(entri).find('cmisra\\:type').eq(0).find('cmis\\:description').eq(0).text();
		ctyp.baseId = $(entri).find('cmisra\\:type').eq(0).find('cmis\\:baseId').eq(0).text();
		ctyp.creatable = $.toBoolean($(entri).find('cmisra\\:type').eq(0).find('cmis\\:creatable').eq(0).text());
		ctyp.fileable = $.toBoolean($(entri).find('cmisra\\:type').eq(0).find('cmis\\:fileable').eq(0).text());
		ctyp.queryable = $.toBoolean($(entri).find('cmisra\\:type').eq(0).find('cmis\\:queryable').eq(0).text());

		ctyp.properties = $(entri).find('cmisra\\:type').eq(0).children();
		ctyp.propertiesData = new Array();
		for (var i=0; i<=ctyp.properties.length; i++)
		{
			var x = ctyp.properties[i];
			if (x) {
				var p = new objectProperty();
				p.name = x.tagName;
				p.value = x.textContent.replaceAll('\n', '<br/>');
				p.type = x.nodeName;
				ctyp.propertiesData.push(p);
			}
		}

		item.cmistype = ctyp;

        feed.item = item;
    }
};
