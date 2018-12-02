var zF$ = (function () {
  /* Name Products */
  function fnFormatNameProdZF(el, limit) {
    /*
    function : limita q quantidade de palavras de acordo com o quantidade de letras no nome do produto
    */
    var name = el.textContent.replace(/\'/g, "\'").replace(/\"/g, "\""), outWords = "", inWords = name.split(" ");
    if (typeof name !== "undefined" && inWords.length > 0) {
      for (var i = 0; i < inWords.length; i++) {
        var cont = "", cont = outWords + inWords[i];
        if (cont.length <= limit) { outWords += inWords[i] + " " } else { outWords += "..."; break }
      }
    }
    return outWords;
  }
    function fnProdName(dataAttr, limitLetter) {
    var oElementsList = document.querySelectorAll("*[" + dataAttr + "]");
    if (oElementsList && typeof oElementsList === "object" && oElementsList.length > 0) {
      for (var i = 0; i < oElementsList.length; i++) {
        var sNameProdData = typeof oElementsList[i].getAttribute(dataAttr) !== 'undefined' ? true : false;
        if (sNameProdData) {
          oElementsList[i].textContent = fnFormatNameProdZF(oElementsList[i], limitLetter);
          oElementsList[i].removeAttribute(dataAttr);
        }
      }
    } else {
      return null;
    }
  }

    /* Price Products */
  function fnProdShowPrice(dataAttr) {
    /*
    function: exibe o valor do produto com/ sem promoção
    */
    var data = document.querySelectorAll("*[" + dataAttr + "]"); /* criar Array com todos os elementos com atributo data : dataAttr */
    if (data && typeof data === "object" && data.length > 0) {
      for (var i = 0; i < data.length; i++) {
        var sPriceProdData = data[i].getAttribute(dataAttr) != "" ? data[i].getAttribute(dataAttr) : "";
        if (sPriceProdData && sPriceProdData !== "") {
          var priceJson = getProperty(sPriceProdData); /* "pn": "0.00"; "po": "0.00"; "cp": "ref0001";"mp":"0" priceJson.pn, priceJson.po, priceJson.cp, priceJson.mp */
          data[i].removeAttribute(dataAttr); /* remove data in dom */

          if (isDet && typeof isDet != undefined) {
            data[i].insertAdjacentHTML('beforeend', fnShowPriceProdDet(priceJson)); //execute function fnShowPrice (){}
          } else {
            data[i].insertAdjacentHTML('beforeend', fnShowPrice(priceJson)); //execute function fnShowPrice (){}
          }


        }
      }
    } else {
      return null;
    }
  }

    function fnUpdateCart(IsAdd, IsSpy) {
    return FCLib$.fnAjaxExecFC("/XMLCart.asp", "IDLoja=" + FC$.IDLoja, false, fnCallbackUpdateCart, IsAdd, IsSpy);
  }

  function fnCallbackUpdateCart(oHTTP, IsAdd, IsSpy) {
    /**/
    if (oHTTP.responseXML) {
      var oXML = oHTTP.responseXML, oCarts = oXML.getElementsByTagName("cart");
      try { var currencyProdCart = (oCarts[0].getElementsByTagName("currency")[0].childNodes[0].nodeValue); } catch (e) { currencyProdCart = FC$.Currency }
      try { var TotalQtyProdCart = (oCarts[0].getElementsByTagName("TotalQty")[0].childNodes[0].nodeValue); } catch (e) { TotalQtyProdCart = "0" }
      try { var subtotalProdCart = (oCarts[0].getElementsByTagName("subtotal")[0].childNodes[0].nodeValue); } catch (e) { subtotalProdCart = "0,00" }

      var itemText = (parseInt(TotalQtyProdCart) > 1) ? "itens" : "item",
        htmlOut = "<a href=\"/AddProduto.asp?IDLoja=" + FC$.IDLoja + "\" title=\"Ir para o carrinho\">" + TotalQtyProdCart + " " + itemText + " | " + currencyProdCart + " " + subtotalProdCart + "</a>";
      if (IsSpy) {
        var oReferrer = window.parent, oTarget = oReferrer.document.getElementById("headerCartLabel");
        if (oTarget) oTarget.innerHTML = htmlOut;
      }
      else {
        var oTarget = document.getElementById("headerCartLabel");
        if (oTarget) oTarget.innerHTML = htmlOut;
      }
    }
  }

    function fnProdShowDiscount(dataAttr) {
    /*
    function: exibe o valor desconto para pordutos em promoção
    */
    var oElementsList = document.querySelectorAll("*[" + dataAttr + "]"); /* criar Array com todos os elementos com atributo data : dataAttr */
    if (oElementsList && typeof oElementsList === "object" && oElementsList.length > 0) {
      for (var i = 0; i < oElementsList.length; i++) {
        var sProdData = oElementsList[i].getAttribute(dataAttr) != "" ? oElementsList[i].getAttribute(dataAttr) : "";
        if (sProdData && sProdData !== "") {
          var priceJson = getProperty(sProdData); /* "pn": "0.00"; "po": "0.00"; "cp": "ref0001";"mp":"0" priceJson.pn, priceJson.po, priceJson.cp, priceJson.mp */
          oElementsList[i].removeAttribute(dataAttr); /**/
          var priceOri = parseFloat(priceJson.po), priceNum = parseFloat(priceJson.pn);
          if (priceOri !== priceNum) {
            var iPercentual = fnFormatNumber(((priceOri - priceNum) / priceOri) * 100);
            var text = document.createTextNode(iPercentual + "%");  // Create a text node
            if (iPercentual >= 50) {
              var colorBackgound = 'zf-sale-gray';
            } else if (iPercentual >= 40) {
              var colorBackgound = 'zf-sale-gray';
            } else {
              var colorBackgound = 'zf-sale-gray';
            }
            oElementsList[i].appendChild(text);
            oElementsList[i].setAttribute('class', 'zf-sale-prodout ' + colorBackgound);
          }
        }
      }
    } else {
      return null;
    }
  }




  function fnExecAllFuncProducts() {
    /* Pages products - exec all function products *//* centraliza as functions das páginas de produtos */
    /* name, price and sale */
    zF$.fnProdName("data-prod-name", 52);
    zF$.fnProdShowPrice("data-prod-price");
    zF$.fnProdShowDiscount("data-prod-discount");
    var eOrderList = document.getElementById("idSelectOrderZF");
    if (eOrderList) eOrderList.innerHTML = zF$.fnProdListSelectOrder();

    /* show button 'mais detalhes' in mobile ande tablet
    if (zF$.detectMobileBrowsers()) {
      zF$.viewDetailsButtonMob('.zf-prodout-details');
    } */

  };
  //CartUpdate
  //
  function addUnitQtyProdCart(elem, number) {
    /* add or diminish the amount quantyty in cart page */
    var idElem = elem.getAttribute("data-qty-id"), elemQty = document.querySelector("#" + idElem);
    if (elemQty && typeof number === 'number') {
      var qtyNow = (elemQty.value == "") ? 0 : parseInt(elemQty.value);
      var newValue = parseInt(qtyNow) + (number);
      if (newValue > 0 && newValue < 1000) {

        elemQty.value = newValue;
        FCLib$.MirrorCartQty(elemQty);
        /*elemQty.style.cssText = "background: #ff4a4a; box-shadow: inset 0px 2px 8px #990000; color: #ffffff;";*/
        var isAlert = document.querySelector('.alert-updade-cart'), iSetTime = 10000; 
        document.getElementById("FCCartRecalculateBut").click();   
        if (!isAlert) {
          //var elemHTML = document.createElement('div');
          //elemHTML.setAttribute('class', 'alert-updade-cart');
          // elemHTML.innerHTML = 'Clique para <button id="FCCartRecalculateBut" type="submit" onclick="document.Lista.Buy.value=\'\';">Atualizar</button>';
          //elemHTML.innerHTML = 'Clique para <button id="FCCartRecalculateBut" type="submit" onclick="document.Lista.Buy.value=\'\';">Atualizar</button>';
        
          //  elem.parentNode.insertBefore(elemHTML, elem.nextSibling);
          // setTimeout(function () { elemHTML.style.display = 'none'; }, iSetTime);
        } else {
          //isAlert.style.display = 'block';
          //elem.parentNode.insertBefore(isAlert, elem.nextSibling);
          // setTimeout(function () { isAlert.style.display = 'none'; }, iSetTime);
        }
      }
    } else {
      console.log("addUnitQtyProdCart: object HTML undefined or parameter 'number' is not type number");
    }
  }

   function addInputQtyProdCart(selector) {
    /* add button for add or decrease quantity in cart page*/
    var aInputQtyProducts = document.querySelectorAll(selector);
    if (aInputQtyProducts && aInputQtyProducts.length > 0) {
      for (var i = 0; i < aInputQtyProducts.length; i++) {
        var oInputQty = aInputQtyProducts[i], idElem = oInputQty.id;
        if (typeof idElem !== 'undefined') {
          //create and add button decrease '-'
          var btnDecrease = document.createElement('span');
          btnDecrease.textContent = '-';
          btnDecrease.setAttribute('class', 'btn-qty-add btn-qty-decrease');
          btnDecrease.setAttribute('data-qty-id', idElem);
          btnDecrease.onclick = function () {
            zF$.addUnitQtyProdCart(this, -1);
          };
          //create and add button plus '+'
          var btnPlus = document.createElement('span');
          btnPlus.textContent = '+';
          btnPlus.setAttribute('class', 'btn-qty-add btn-qty-plus');
          btnPlus.setAttribute('data-qty-id', idElem);
          btnPlus.onclick = function () {
            zF$.addUnitQtyProdCart(this, 1);
          };
          oInputQty.parentNode.insertBefore(btnDecrease, oInputQty);
          oInputQty.parentNode.insertBefore(btnPlus, oInputQty.nextSibling);
        } else {
          console.log('addInputQtyProdCart: attribute id in object HTML undefined');
        }
      }
    } else {
      console.log('addInputQtyProdCart: fields inputs quantity undefined');
    }
  }

    function detectMobileBrowsers() {
    /*
     * By Chad Smith, https://twitter.com/chadsmith
     * source: http://detectmobilebrowser.com/mobile
     * Regex updated: 1 August 2014
     * Detect mobile and tablet (android|bb\d+|meego|ipad|playbook|silk)
     */
    var a = navigator.userAgent || navigator.vendor || window.opera;
    if (/(android|bb\d+|meego|ipad|playbook|silk).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
      // alert('is Mobile browser');
      return true;
    } else {
      // alert('Not is Mobile browser');
      return false;
    }
  }

  function fnChangeInnerText(elem, text) {
    var elem = document.querySelector(elem);
    if (elem) elem.textContent = text;
  }

  function fnLoginClient(dataAttr) {
    /*
    function : login/ logout
    */
    var loginContainer = document.querySelectorAll(".zFContactLogin");
    var nameAll = document.querySelectorAll("*[" + dataAttr + "]");
    if (nameAll.length > 0) {
      for (var i = 0; i < nameAll.length; i++) {
        var nameAllAttr = nameAll[i].getAttribute(dataAttr);
        var idWordSpace = nameAllAttr.indexOf(' ');//Para cortar o resto do nome a partir do espaço
        if (nameAllAttr !== "") {
          if (idWordSpace > 0) {
            console.log("aaaa");
            nameAll[i].innerHTML = "Olá <b>" + nameAllAttr.substring(0, idWordSpace) + ",</b> <a href=\"#\" onclick=\"FCLib$.fnClientLogout('account')\">sair</a>";
          }
          else { nameAll[i].innerHTML = "Olá <b>" + nameAllAttr + ",</b> <a href=\"#\" onclick=\"FCLib$.fnClientLogout('account')\">sair</a>"; }
        }
      }
    } else {
      return false;
    }
  }


  /* exports */
  return {
  	fnProdShowPrice: fnProdShowPrice,
  	fnProdShowDiscount: fnProdShowDiscount,
    addUnitQtyProdCart: addUnitQtyProdCart,
    addInputQtyProdCart: addInputQtyProdCart,
    fnUpdateCart: fnUpdateCart,
    fnFormatNameProdZF: fnFormatNameProdZF,
    fnExecAllFuncProducts: fnExecAllFuncProducts,
    fnProdName: fnProdName, 
    detectMobileBrowsers: detectMobileBrowsers,
    fnChangeInnerText: fnChangeInnerText,
    fnLoginClient: fnLoginClient
  }
})();

(function () {

  //define class responsive for #idFCContent
  var getBodyClass = document.body.getAttribute('class');
  if (getBodyClass === "FCProduct ProductList" || getBodyClass === "FCNewsletter" || getBodyClass === "FCAdvancedSearch" || getBodyClass === "FCCategories") {
    var domColumn = document.getElementById('idFCContent');
    if (domColumn) domColumn.setAttribute('class', 'col-sm-8 col-md-9 col-lg-9');
  }
  else if (getBodyClass === "FCProduct ProductDet" || getBodyClass === "FCHelp") {
    var domColumn = document.getElementById('idFCContent');
    if (domColumn) domColumn.setAttribute('class', 'col-xs-12 col-sm-12 col-md-12 col-lg-12');
  }
  zF$.fnLoginClient("data-login-name-client");
  zF$.fnProdName("data-prod-name", 52);
  zF$.fnProdShowPrice("data-prod-price");
  zF$.fnProdShowDiscount("data-prod-discount");
  zF$.fnUpdateCart(true, false);

  /*  show button 'mais detalhes' in mobile ande tablet
  if (zF$.detectMobileBrowsers()) {
   // zF$.viewDetailsButtonMob('.zf-prodout-details');
  } */

  if (FC$.Page == "Products") {
    //zF$.previousDescription("previousDescription", 120);
    zF$.fnExecAllFuncProducts();
  }

  if (FC$.Page == "Cart") {
    zF$.addInputQtyProdCart(".FCCartQtyInput");
  }

  /* if (FC$.Page == "Products") {
    // formatter length name products cross-selling
    var aNameCrossSelling = document.querySelectorAll('#idListProdCrossFC .EstNameProdCross a');
    if (aNameCrossSelling && aNameCrossSelling.length > 0) {
      for (var i = 0; i < aNameCrossSelling.length; i++) {
        zF$.formatterNameCrossSelling(aNameCrossSelling[i], 45);
      }
    }
  } */

  if (FC$.Page == "Cart") {
    zF$.fnChangeInnerText("#FCCartFreightSimulationBut", "Calcular frete");
    zF$.fnChangeInnerText("#FCCartRecalculateBut", "Atualizar");
    zF$.fnChangeInnerText("#idTxtRecalculateFC b", "Atualizar");
    //zF$.fnChangeInnerText("#FCCartStillShoppingBut","Continuar Compras");
    //zF$.fnChangeInnerText("#FCCartBuyBut","Finalizar");
  }
  else if (FC$.Page == "AdvancedSearch") {
    zF$.fnChangeInnerText(".Titulos", "Busca Avançada");
  }

  //custom 
  if (FC$.Page == "Custom") {
    zF$.addFieldsFormSearchCustom('#contentFieldsForm');
  }

})();

 