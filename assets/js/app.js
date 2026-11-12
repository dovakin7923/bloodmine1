(function () {
  'use strict';

  /* Сроки действия: цена зависит от срока. «Навсегда» = 10 месячных цен (демонстрационное допущение). */
  var TERMS = [
    {label: 'На месяц', factor: 1, word: 'на месяц'},
    {label: 'Навсегда', factor: 10, word: 'навсегда'}
  ];
  var products = {
    ranks: [
      {name: 'Цербер', price: 14}, {name: 'Маркиз', price: 39}, {name: 'Граф', price: 59},
      {name: 'Орион', price: 99}, {name: 'Визирь', price: 149}, {name: 'Феникс', price: 239},
      {name: 'Рыцарь', price: 329}, {name: 'Правитель', price: 529}, {name: 'Властелин', price: 879}, {name: 'Император', price: 1299}
    ],
    cases: [{name: 'Стартовый кейс', price: 19}, {name: 'Кейс исследователя', price: 49}, {name: 'Кейс героя', price: 99}, {name: 'Коллекция сезона', price: 149}],
    shards: [{name: '100 осколков', price: 29}, {name: '300 осколков', price: 69}, {name: '700 осколков', price: 129}, {name: '1500 осколков', price: 249}],
    other: [{name: 'Цветной ник', price: 29}, {name: 'Эффект появления', price: 49}, {name: 'Набор эмоций', price: 79}]
  };
  var state = {category: 'ranks', index: 1, term: 0};
  var dialogOpener = null;

  function $(id) { return document.getElementById(id); }
  function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + '\u00a0₽'; }
  function current() { return products[state.category][state.index]; }
  function priceFor(item, termIndex) { return item.price * TERMS[termIndex].factor; }

  /* ---------- каталог ---------- */
  function buildList() {
    var list = $('product-list');
    if (!list) return;
    list.textContent = '';
    products[state.category].forEach(function (item, index) {
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'product-row' + (index === state.index ? ' chosen' : '');
      row.setAttribute('aria-pressed', index === state.index ? 'true' : 'false');
      row.setAttribute('data-index', index);
      var name = document.createElement('span');
      name.textContent = item.name;
      var price = document.createElement('span');
      price.className = 'product-price';
      price.textContent = 'от ' + money(item.price) + ' ›';
      row.appendChild(name);
      row.appendChild(price);
      list.appendChild(row);
    });
  }

  function li(text, accent) {
    var el = document.createElement('li');
    if (accent === undefined) {
      el.textContent = text;
    } else {
      el.appendChild(document.createTextNode(text + ' — '));
      var s = document.createElement('span');
      s.textContent = accent;
      el.appendChild(s);
    }
    return el;
  }

  function updateDetails() {
    if (!$('product-list')) return;
    var item = current();
    var rows = $('product-list').children;
    for (var i = 0; i < rows.length; i++) {
      var on = i === state.index;
      rows[i].classList.toggle('chosen', on);
      rows[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    $('preview-name').textContent = item.name;
    $('product-name').textContent = item.name;
    var img = $('preview-image');
    img.src = state.category === 'cases' ? 'assets/images/chest.png' : 'assets/images/player.png';
    img.alt = 'Превью товара «' + item.name + '»';
    var ul = document.createElement('ul');
    if (state.category === 'ranks') {
      ul.appendChild(li('Название в чате', item.name));
      ul.appendChild(li('Оформление профиля', 'цвет и стиль'));
      ul.appendChild(li('Дополнительный набор', 'предметы'));
      ul.appendChild(li('Коллекция эффектов', 'для персонажа'));
    } else {
      ul.appendChild(li('Выбранный набор', item.name));
      ul.appendChild(li('Описание игровой коллекции'));
      ul.appendChild(li('Содержимое можно посмотреть в каталоге'));
    }
    var box = $('product-description');
    box.textContent = '';
    box.appendChild(ul);
    var buttons = document.querySelectorAll('.terms button');
    for (var t = 0; t < buttons.length; t++) {
      buttons[t].textContent = TERMS[t].label + ' — ' + money(priceFor(item, t));
      buttons[t].classList.toggle('selected', t === state.term);
      buttons[t].setAttribute('aria-pressed', t === state.term ? 'true' : 'false');
    }
    $('choose-product').textContent = 'Выбрать за ' + money(priceFor(item, state.term));
  }

  function setCategory(category) {
    state.category = category;
    state.index = 0;
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].getAttribute('data-category') === category;
      tabs[i].classList.toggle('active', on);
      tabs[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    buildList();
    updateDetails();
  }

  function selectProduct() {
    var item = current();
    var opener = $('choose-product');
    openDialog(item.name, 'Вы выбрали «' + item.name + '», срок: ' + TERMS[state.term].word +
      ', стоимость: ' + money(priceFor(item, state.term)) +
      '. Это демонстрация каталога: оплата и выдача игровых товаров недоступны.', opener);
  }

  /* ---------- окно ---------- */
  function openDialog(title, text, opener) {
    dialogOpener = opener || document.activeElement;
    $('dialog-title').textContent = title;
    $('dialog-text').textContent = text;
    $('dialog').classList.add('visible');
    var ok = $('dialog').querySelector('.orange');
    if (ok) ok.focus();
  }

  function closeDialog() {
    $('dialog').classList.remove('visible');
    if (dialogOpener && document.body.contains(dialogOpener)) dialogOpener.focus();
    dialogOpener = null;
  }

  function dialogIsOpen() { return $('dialog').classList.contains('visible'); }

  /* ---------- правила ---------- */
  function toggleRule(button) {
    var rule = button.parentNode;
    var open = rule.classList.toggle('open');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    var mark = button.querySelector('b');
    if (mark) mark.textContent = open ? '−' : '+';
  }

  /* ---------- события ---------- */
  document.addEventListener('click', function (event) {
    var target = event.target;
    var el;
    if ((el = target.closest('.tab[data-category]'))) { setCategory(el.getAttribute('data-category')); return; }
    if ((el = target.closest('.product-row'))) { state.index = parseInt(el.getAttribute('data-index'), 10); updateDetails(); return; }
    if ((el = target.closest('.terms button'))) { state.term = parseInt(el.getAttribute('data-term'), 10); updateDetails(); return; }
    if (target.closest('#choose-product')) { selectProduct(); return; }
    if ((el = target.closest('.rule-heading'))) { toggleRule(el); return; }
    if ((el = target.closest('[data-reward]'))) {
      var name = el.getAttribute('data-reward');
      openDialog(name, 'Пример награды «' + name + '». Здесь можно изучить оформление коллекции. Получение предметов на игровом сервере не подключено.', el);
      return;
    }
    if (target.closest('[data-close]') || target === $('dialog')) { closeDialog(); }
  });

  document.addEventListener('keydown', function (event) {
    if (!dialogIsOpen()) return;
    if (event.key === 'Escape') { event.preventDefault(); closeDialog(); return; }
    if (event.key === 'Tab') {
      var focusable = $('dialog').querySelectorAll('button');
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  if ($('product-list')) { buildList(); updateDetails(); }
})();
