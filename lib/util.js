const getCachePosts = (inHexo) => {
  const empty = { data: [], length: 0 }
  if (!inHexo) return empty
  if (!inHexo.locals) return empty
  if (!inHexo.locals.cache) return empty
  return inHexo.locals.cache.get('posts')
}

module.exports.normalizeGaData = (inGaData) => {
  const gaData = []
  const afterAddedData = []

  for (let i = 0; i < inGaData.length; i++) {
    if (inGaData[i].path == normalizeURL_inner(inGaData[i].path)) {
      gaData.push(inGaData[i])
    } else {
      afterAddedData.push(inGaData[i])
    }
  }

  if (afterAddedData.length > 0) {
    for (let i = 0; i < afterAddedData.length; i++) {
      let isAdded = false
      for (let k = 0; k < gaData.length; k++) {
        if (normalizeURL_inner(afterAddedData[i].path) == gaData[k].path) {
          // console.log( gaData[k].pv +' + '+ afterAddedData[i].pv + ' -> ' + afterAddedData[i].path)
          gaData[k].pv = gaData[k].pv + afterAddedData[i].pv
          gaData[k].totalPV = gaData[k].totalPV + afterAddedData[i].totalPV
          isAdded = true
          break
        }
      }

      if (!isAdded) {
        const pushArr = afterAddedData[i]
        pushArr.path = normalizeURL_inner(pushArr.path)
        gaData.push(pushArr)
      }
    }
  }

  // console.log('\n--- normalizeURL ---\n');
  // for(let k=0; k < gaData.length; k++){
  //     console.log(gaData[k].pv + ' : ' + gaData[k].path);
  // }

  return gaData
}


module.exports.isMatchedElement = (inStr, inLists) => {
  if (!inStr || inStr == '' || !inLists || inLists.length == 0) return false
  const flg = false
  for (let i = 0; i < inLists.length; i++) {
    if (inLists[i] != null && inLists[i] != undefined && inLists[i] != '') {
      const reg = new RegExp(inLists[i])
      if (reg.test(inStr)) {
        return true
      }
    }
  }
  return flg
}

module.exports.replaceHTMLtoText = (inStr) => {
  let tmpStr = inStr
  tmpStr = tmpStr.replace(/\r|\n/g, '').replace(/\<style\>.*?\<\/style\>/g, '').replace(/\<style\s.*?\<\/style\>/g, '').replace(/\<script\>.*?\<\/script\>/g, '').replace(/\<script\s.*?\<\/script\>/g, '').replace(/\<figure\s.*?\<\/figure\>/g, '').replace(/\<code.*?\<\/code\>/g, '').replace(/\<a\>/g, '').replace(/\<a\s.*?\>/g, '').replace(/\<\/a>/g, '').replace(/\<b\>/g, '').replace(/\<\/b\>/g, '').replace(/\<strong\>/g, '').replace(/\<\/strong\>/g, '').replace(/\<em\>/g, '').replace(/\<\/em\>/g, '').replace(/\<kbd\>/g, '').replace(/\<\/kbd\>/g, '').replace(/\<del\>/g, '').replace(/\<\/del\>/g, '').replace(/\<code\>/g, '').replace(/\<\/code\>/g, '').replace(/\<span\>/g, '').replace(/\<\/span\>/g, '').replace(/\<span\s.*?\>/g, '').replace(/\<\/span\>/g, '').replace(/\<.*?>/g, '\n').replace(/(\n\s)+/g, '\n').replace(/\n+/g, '%0D%0A')

  // console.log('\n\n' + '--- debug ---' + tmpStr +'\n\n')

  return tmpStr
}

module.exports.decord_unicode = (inStr) => {
  let result = inStr
  let tmpStr = ''
  const decStrings = inStr

  tmpStr = decStrings.replace(/(<br>|<br \/>)/gi, '\n')
  tmpStr = tmpStr.replace(/(\(|（)/gi, '(')
  tmpStr = tmpStr.replace(/(\)|）)/gi, ')')
  tmpStr = tmpStr.replace(/\s+/gi, ' ')

  tmpStr = tmpStr.replace(/\&\#x([0-9a-zA-Z]{4});/g, '%u' + '$1').replace(/\&\#x([0-9a-zA-Z]{3});/g, '%u0' + '$1').replace(/\&\#x([0-9a-zA-Z]{2});/g, '%' + '$1')
  result = unescape(tmpStr)

  // console.log('\n\n' + '--- debug ---' + result +'\n\n');

  return result
}

module.exports.gaDataModel = (inObj) => {
  return gaDataModel_inner(inObj)
}

const gaDataModel_inner = (inObj) => {
  return Object.assign({}, {
    'updated': '0',
    'title': '',
    'path': '',
    'eyeCatchImage': '',
    'excerpt': '',
    'date': '',
    'pv': 0,
    'totalPV': 0,
    'categories': [],
    'tags': [],
    'internalLinks': [],
    'keywords': [],
    'keywordsLength': 0,
  }, inObj)
}

module.exports.normalizeURL = (inURL) => {
  return normalizeURL_inner(inURL)
}

const normalizeURL_inner = (inURL) => {
  if (!inURL) return ''
  let retURL = inURL.replace(/^\//, '').replace(/search\?.+/, '').replace(/\?.+/, '').replace(/\#.+/, '').replace(/\&.+/, '').replace(/\/amp\//, '/').replace(/\/index\.html/, '/')
  if (retURL == '') retURL = '/'
  return retURL
}


module.exports.categorieName = (inCategories) => {
  if (!inCategories) return ''
  let catName = ''
  for (let r = 0; r < inCategories.data.length; r++) {
    if (catName != '') catName += ' > '
    catName += inCategories.data[r].name
  }
  return catName
}

module.exports.tagName = (inTags) => {
  if (!inTags) return ''
  const retTags = []
  inTags.data.forEach((item) => {
    retTags.push(item.name)
  })
  return retTags
}

// orverride config.popularPosts.tmp data
module.exports.orverrideTmp = (inGaData, inHexo) => {
  let gaData_tmp = inGaData

  // load hexo@3.2's cache
  // ----------------------------------------------
  let isUseHexosCache = false
  const cachePosts = getCachePosts(inHexo)
  if ((!inGaData || inGaData == []) && cachePosts.length && cachePosts.data[0].popularPost_tmp_gaData) {
    isUseHexosCache = true
    gaData_tmp = null
    gaData_tmp = []
    const postPath_temp = []
    for (let v = 0; v < cachePosts.length; v++) {
      gaData_tmp.push(cachePosts.data[v].popularPost_tmp_gaData)
      if (cachePosts.data[v].popularPost_tmp_postPath) postPath_temp.push(cachePosts.data[v].path)
    }

    inHexo.config.popularPosts.tmp = Object.assign({},
        inHexo.config.popularPosts.tmp, {
          'gaData': gaData_tmp,
          'postPath': postPath_temp,
        })
  }
  // ----------------------------------------------

  if (!isUseHexosCache) {
    inHexo.config.popularPosts.tmp = Object.assign({},
        inHexo.config.popularPosts.tmp, {
          'gaData': inGaData,
        })
  }

  // console.log('-- (debug) inHexo.config.popularPosts.tmp.gaData ---')
  // for(let i=0; i<inHexo.config.popularPosts.tmp.gaData.length; i++){
  //  console.log('tmp : ' + inHexo.config.popularPosts.tmp.gaData[i].path)
  // }
}

module.exports.getCachePosts = getCachePosts
