INSERT INTO
  currencies (code)
VALUES
  ('AUD'),
  ('BGN'),
  ('BRL'),
  ('CAD'),
  ('CHF'),
  ('CNY'),
  ('CZK'),
  ('DKK'),
  ('EUR'),
  ('GBP'),
  ('HKD'),
  ('HRK'),
  ('HUF'),
  ('IDR'),
  ('ILS'),
  ('INR'),
  ('ISK'),
  ('JPY'),
  ('KRW'),
  ('MXN'),
  ('MYR'),
  ('NOK'),
  ('NZD'),
  ('PHP'),
  ('PLN'),
  ('RON'),
  ('RUB'),
  ('SEK'),
  ('SGD'),
  ('THB'),
  ('TRY'),
  ('USD'),
  ('ZAR'),
  ('AED'),
  ('GBX');

INSERT INTO
  exchangerates (base_currency_code, quote_currency_code)
VALUES
  ('EUR', 'USD'),
  ('EUR', 'AUD'),
  ('EUR', 'BGN'),
  ('EUR', 'BRL'),
  ('EUR', 'CAD'),
  ('EUR', 'CHF'),
  ('EUR', 'CNY'),
  ('EUR', 'CZK'),
  ('EUR', 'DKK'),
  ('EUR', 'GBP'),
  ('EUR', 'HKD'),
  ('EUR', 'HRK'),
  ('EUR', 'HUF'),
  ('EUR', 'IDR'),
  ('EUR', 'ILS'),
  ('EUR', 'INR'),
  ('EUR', 'ISK'),
  ('EUR', 'JPY'),
  ('EUR', 'KRW'),
  ('EUR', 'MXN'),
  ('EUR', 'MYR'),
  ('EUR', 'NOK'),
  ('EUR', 'NZD'),
  ('EUR', 'PHP'),
  ('EUR', 'PLN'),
  ('EUR', 'RON'),
  ('EUR', 'RUB'),
  ('EUR', 'SEK'),
  ('EUR', 'SGD'),
  ('EUR', 'THB'),
  ('EUR', 'TRY'),
  ('EUR', 'ZAR'),
  ('GBP', 'GBX'),
  ('USD', 'AED');

INSERT INTO
  exchangerates_prices (date, value, exchangerate_id)
SELECT
  x.date::date, x.value::decimal, er.id
FROM
  ( VALUES
      ('1999-01-04', '1.1789', 'EUR', 'USD'),
      ('1999-01-05', '1.1790', 'EUR', 'USD'),
      ('1999-01-06', '1.1743', 'EUR', 'USD'),
      ('1999-01-07', '1.1632', 'EUR', 'USD'),
      ('1999-01-08', '1.1659', 'EUR', 'USD'),
      ('1999-01-11', '1.1569', 'EUR', 'USD'),
      ('1999-01-12', '1.1520', 'EUR', 'USD'),
      ('1999-01-13', '1.1744', 'EUR', 'USD'),
      ('1999-01-14', '1.1653', 'EUR', 'USD'),
      ('1999-01-15', '1.1626', 'EUR', 'USD'),
      ('1999-01-18', '1.1612', 'EUR', 'USD'),
      ('1999-01-19', '1.1616', 'EUR', 'USD'),
      ('1999-01-20', '1.1575', 'EUR', 'USD'),
      ('1999-01-21', '1.1572', 'EUR', 'USD'),
      ('1999-01-22', '1.1567', 'EUR', 'USD'),
      ('1999-01-25', '1.1584', 'EUR', 'USD'),
      ('1999-01-26', '1.1582', 'EUR', 'USD'),
      ('1999-01-27', '1.1529', 'EUR', 'USD'),
      ('1999-01-28', '1.1410', 'EUR', 'USD'),
      ('1999-01-29', '1.1384', 'EUR', 'USD'),
      ('1971-01-01', '100.00', 'GBP', 'GBX'),
      ('1990-01-01', '3.6725', 'USD', 'AED')
  ) x (date, value, base_currency_code, quote_currency_code)
  JOIN exchangerates er ON (
    er.base_currency_code = x.base_currency_code
    AND er.quote_currency_code = x.quote_currency_code
  );
