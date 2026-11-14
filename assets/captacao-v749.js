(() => {
  'use strict';
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-lead-goal]');
    if (!link) return;
    const form = document.querySelector('[data-lead-form]');
    const goal = form?.elements.goal;
    if (goal && [...goal.options].some(option => option.value === link.dataset.leadGoal)) {
      goal.value = link.dataset.leadGoal;
      goal.dispatchEvent(new Event('change', {bubbles:true}));
    }
  });
})();
