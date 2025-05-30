export function enableValidation(validationConfig) {
  const forms = Array.from(
    document.querySelectorAll(validationConfig.formSelector)
  );
  forms.forEach((formElement) => {
    const formInputs = Array.from(
      formElement.querySelectorAll(validationConfig.inputSelector)
    );
    const formBtn = formElement.querySelector(
      validationConfig.submitButtonSelector
    );
    toggleButtonState(formInputs, formBtn, validationConfig);
    formInputs.forEach((inputElement) => {
      inputElement.addEventListener("input", () => {
        checkInputValidity(formElement, inputElement, validationConfig);
        toggleButtonState(formInputs, formBtn, validationConfig);
      });
      
      // Для полей URL добавляем дополнительную проверку при потере фокуса
      if (inputElement.type === 'url' || inputElement.name === 'link') {
        inputElement.addEventListener('blur', () => {
          validateImageUrl(inputElement, formElement, validationConfig);
        });
      }
    });
  });
}

// Новая функция для проверки URL изображения
async function validateImageUrl(inputElement, formElement, validationConfig) {
  if (!inputElement.value) return;
  
  try {
    // Проверяем, что URL соответствует формату http/https
    if (!/^https?:\/\/.+/i.test(inputElement.value)) {
      throw new Error('Введите корректный URL (начинается с http:// или https://)');
    }
    
    // Проверяем доступность изображения
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('Не удалось загрузить изображение по указанному URL'));
      img.src = inputElement.value;
    });
    
    // Если проверка прошла успешно, очищаем ошибку
    hideInputError(formElement, inputElement, validationConfig);
    inputElement.setCustomValidity("");
  } catch (error) {
    showInputError(
      formElement,
      inputElement,
      error.message,
      validationConfig
    );
    inputElement.setCustomValidity(error.message);
  }
}

function toggleButtonState(inputList, buttonElement, validationConfig) {
  if (hasInvalidInput(inputList)) {
    buttonElement.classList.add(validationConfig.inactiveButtonClass);
    buttonElement.disabled = true;
  } else {
    buttonElement.classList.remove(validationConfig.inactiveButtonClass);
    buttonElement.disabled = false;
  }
}

function hasInvalidInput(inputList) {
  return inputList.some((input) => !input.validity.valid);
}

function checkInputValidity(formElement, inputElement, validationConfig) {
  if (inputElement.validity.patternMismatch){
    inputElement.setCustomValidity(inputElement.dataset.errorMessage);
  } else {
    inputElement.setCustomValidity("");
  }
  if (!inputElement.validity.valid) {
    showInputError(
      formElement,
      inputElement,
      inputElement.validationMessage,
      validationConfig
    );
  } else {
    hideInputError(formElement, inputElement, validationConfig);
  }
}

function showInputError(
  formElement,
  inputElement,
  errorMessage,
  validationConfig
) {
  const errorElement = formElement.querySelector(`.${inputElement.name}-error`);
  inputElement.classList.add(validationConfig.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(validationConfig.errorClass);
}

function hideInputError(formElement, inputElement, validationConfig) {
  const errorElement = formElement.querySelector(`.${inputElement.name}-error`);
  inputElement.classList.remove(validationConfig.inputErrorClass);
  errorElement.classList.remove(validationConfig.errorClass);
  errorElement.textContent = "";
}

export function clearValidation(form, validationConfig) {
  const formInputs = Array.from(
    form.querySelectorAll(validationConfig.inputSelector)
  );
  const formBtn = form.querySelector(validationConfig.submitButtonSelector);

  formInputs.forEach((input) => hideInputError(form, input, validationConfig));
  toggleButtonState(formInputs, formBtn, validationConfig)
}
