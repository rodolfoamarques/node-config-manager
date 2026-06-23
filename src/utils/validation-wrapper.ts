import * as Joi from 'joi';

export function validateWrapper<T>(value: T, rules: Joi.AnySchema<T>): T {
  const config: Joi.ValidationOptions = {
    abortEarly: false,
    allowUnknown: true,
    convert: false,
    dateFormat: 'iso',
    noDefaults: true,
    presence: 'required',
    stripUnknown: true,
  };

  const validationResult = rules.validate(value, config);

  if (validationResult.error) {
    const validationError = new Error(validationResult.error.message);
    validationError.name = 'ConfigValidationError';

    throw validationError;
  }

  const unknownPropertiesValidation = rules.validate(value, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: false,
  });

  if (validationResult.warning || unknownPropertiesValidation.error) {
    const allIssues = [
      ...(validationResult.warning?.details || []),
      ...(unknownPropertiesValidation.error?.details || [])
    ];

    const messages = allIssues.map((item) => `${item.path.join('.')} - ${item.message}`);

    // eslint-disable-next-line no-console
    console.warn(`Config Validation Warnings:\n  ${messages.join('\n  ')}`);
  }

  return validationResult.value;
}
