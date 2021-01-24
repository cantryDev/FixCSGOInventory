CInventory.prototype.GetInventoryLoadURL = function () {
    if (this.m_appid === 730) {
        console.log("Loading csgo inventory via different endpoint :D")
        return "https://steamcommunity.com/profiles/" + this.m_steamid + "/inventory/json/730/2/";
    }

    return 'https://steamcommunity.com/inventory/' + this.m_steamid + '/' + this.m_appid + '/' + this.m_contextid;
};

CInventory.prototype.LoadMoreAssets = function (count) {
    if (this.m_ActivePromise)
        return this.m_ActivePromise;

    if (this.m_bFullyLoaded)
        return $J.Deferred().resolve().promise();

    // we won't re-request for 5 seconds after a failure
    if (this.m_tsLastError && $J.now() - this.m_tsLastError < 5000)
        return $J.Deferred().reject().promise();

    this.m_$Inventory.addClass('loading');
    var _this = this;

    if (!count)
        count = this.m_bPerformedInitialLoad ? 2000 : 75;

    var params = {
        'l': 'english',
        'count': count
    };

    if (typeof (g_bIsInMarketplace) != 'undefined' && g_bIsInMarketplace)
        params.market = 1;

    if (this.m_ulLastAssetID)
        params.start_assetid = this.m_ulLastAssetID;

    this.m_owner.ShowLoadingIndicator();

    return this.SetActivePromise($J.get(this.GetInventoryLoadURL(), params
    ).done(function (data) {

        if (data !== undefined) {

            if (data.success) {
                if (data.rgInventory) {
                    let assets = [];
                    let total_inventory_count = 0;
                    Object.keys(data.rgInventory).forEach(key => {
                        let currentAsset = data.rgInventory[key];
                        let asset = {
                            "appid": 730,
                            "contextid": "2",
                            "assetid": currentAsset.id,
                            "classid": currentAsset.classid,
                            "instanceid": currentAsset.instanceid,
                            "amount": currentAsset.amount
                        }
                        total_inventory_count = currentAsset.pos;
                        assets.push(asset);
                    });
                    let descriptions = [];
                    Object.keys(data.rgDescriptions).forEach(key => {
                        descriptions.push(data.rgDescriptions[key]);
                    });

                    let success = 1;
                    let rwgrsn = -2;
                    assets.sort((a, b) => (parseInt(a.assetid) < parseInt(b.assetid)) ? 1 : ((parseInt(b.assetid) < parseInt(a.assetid)) ? -1 : 0));
                    data = {assets, descriptions, total_inventory_count, success, rwgrsn};
                }
            } else {
                alert("Steamapi return invalid data")
            }

        }

        _this.m_bPerformedInitialLoad = true;
        _this.m_$Inventory.removeClass('loading');
        _this.AddInventoryData(data);
        _this.m_tsLastError = 0;
        _this.HideInventoryLoadError();
        _this.m_SingleResponsivePage.EnsurePageItemsCreated();

        if (_this.m_parentInventory)
            _this.m_parentInventory.m_SingleResponsivePage.EnsurePageItemsCreated();

    }).fail(function () {
        _this.m_tsLastError = $J.now();
        _this.ShowInventoryLoadError();
    }).always(function () {
        _this.m_owner.HideLoadingIndicator();
    })).done(function () {
        // intentionally done outside SetActivePromise so active promise will bset.
        for (var i = 0; i < _this.m_rgOnItemsLoadedCallbacks.length; i++)
            _this.m_rgOnItemsLoadedCallbacks[i]();
    }).promise();
};

CInventory.prototype.ReadTags = function () {
    this.tags = {};

    for (var key in this.m_rgDescriptions) {
        var description = this.m_rgDescriptions[key];
        if (!description.use_count)
            continue;

        for (var tagid in description.tags) {
            var rgTag = description.tags[tagid];
            var rgCategory = this.tags[rgTag.category];

            if (!rgCategory) {
                if (typeof rgTag.category != "string")
                    continue;

                rgCategory = this.tags[rgTag.category] = {
                    "name": rgTag.localized_category_name ? rgTag.localized_category_name : rgTag.category,
                    "tags": {}
                };
            }

            if (rgCategory.tags[rgTag.internal_name]) {
                rgCategory.tags[rgTag.internal_name].count += description.use_count;
            } else {
                var rgNewTag = {
                    "name": rgTag.name ? rgTag.name : rgTag.localized_tag_name,
                    "count": description.use_count
                };
                if (rgTag.color)
                    rgNewTag.color = rgTag.color;
                rgCategory.tags[rgTag.internal_name] = rgNewTag;
            }
        }
    }
};
