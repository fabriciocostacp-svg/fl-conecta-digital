(function () {
  'use strict';

  var WHATSAPP_NUMBER = '5519999717781';
  var STORAGE_KEY = 'flConectaLeads';
  var PORTAL_URL = 'https://portal.flconectadigital.com.br/';

  function setYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function initNav() {
    var header = document.querySelector('.header');
    var toggle = document.getElementById('nav-toggle');
    var cluster = document.getElementById('header-cluster');
    if (!header || !toggle || !cluster) return;

    function closeMenu() {
      header.classList.remove('header--menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('header--menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    cluster.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.matchMedia('(max-width: 767px)').matches) closeMenu();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  function initFaq() {
    var items = document.querySelectorAll('.faq-item');
    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        items.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  }

  function initReveal() {
    var nodes = document.querySelectorAll('[data-reveal]');
    if (!nodes.length) return;

    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach(function (node) { node.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    nodes.forEach(function (node) { observer.observe(node); });
  }

  function clearErrors(form) {
    form.querySelectorAll('.field--invalid').forEach(function (field) {
      field.classList.remove('field--invalid');
    });
    form.querySelectorAll('.field__error').forEach(function (error) {
      error.textContent = '';
    });
  }

  function showError(element, message) {
    if (!element) return;
    var field = element.closest('.field');
    if (!field) return;
    field.classList.add('field--invalid');
    var error = field.querySelector('.field__error');
    if (error) error.textContent = message;
  }

  function saveLead(data) {
    try {
      var current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(current)) current = [];
      current.push(Object.assign({ savedAt: new Date().toISOString() }, data));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (error) {
      console.warn('Não foi possível salvar os dados localmente.', error);
    }
  }

  function initForm() {
    var form = document.getElementById('lead-form');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearErrors(form);

      var nome = document.getElementById('lead-nome');
      var whatsapp = document.getElementById('lead-whatsapp');
      var tipo = document.getElementById('lead-tipo');
      var cidade = document.getElementById('lead-cidade');
      var necessidade = document.getElementById('lead-necessidade');
      var email = document.getElementById('lead-email');

      var data = {
        nome: nome.value.trim(),
        whatsapp: whatsapp.value.trim(),
        tipoNegocio: tipo.value.trim(),
        cidade: cidade.value.trim(),
        necessidade: necessidade.value.trim(),
        email: email.value.trim()
      };

      var valid = true;
      if (!data.nome) { showError(nome, 'Informe seu nome.'); valid = false; }
      if (data.whatsapp.replace(/\D/g, '').length < 10) { showError(whatsapp, 'Informe um WhatsApp válido com DDD.'); valid = false; }
      if (!data.tipoNegocio) { showError(tipo, 'Informe o tipo de negócio.'); valid = false; }
      if (!data.cidade) { showError(cidade, 'Informe sua cidade.'); valid = false; }
      if (!data.necessidade) { showError(necessidade, 'Selecione uma opção.'); valid = false; }
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { showError(email, 'Informe um e-mail válido.'); valid = false; }
      if (!valid) return;

      data.portal = PORTAL_URL;
      saveLead(data);

      var message =
        'Olá! Quero uma orientação da FL Conecta Digital.\n\n' +
        'Nome: ' + data.nome + '\n' +
        'WhatsApp: ' + data.whatsapp + '\n' +
        'Tipo de negócio: ' + data.tipoNegocio + '\n' +
        'Cidade: ' + data.cidade + '\n' +
        'Maior necessidade: ' + data.necessidade + '\n' +
        'E-mail: ' + (data.email || 'Não informado');

      window.location.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
    });
  }

  setYear();
  initNav();
  initFaq();
  initReveal();
  initForm();
}());
