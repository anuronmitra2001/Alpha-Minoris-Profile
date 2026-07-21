PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

DELETE FROM 'DocumentItem';
DELETE FROM 'ExpenseItem';
DELETE FROM 'IncomeSource';
DELETE FROM 'Customer';

insert into 'Customer' (
    'ID', 
    'FullName',
    'CoApplicantFullName', 
    'Email', 
    'Phone', 
    'HouseHoldSize', 
    'PreferredLanguage',
    'EmploymentStatus',
    'EmployerName',
    'ContractType',
    'AvailableCapital',
    'AvailableAssetsWorth',
    'PreferredLocations',
    'PreferredPropertyTypes',
    'InvestmentGoal',
    'Timeline',
    'MaxNegativeCashFlow',
    'CreatedAt',
    'UpdatedAt')
    
    values (
    1, 
    'Heinrich Schmidt', 
    'Heidi Schmidt', 
    'heinrich.schmidt@gmail.com', 
    '+49123456789', 
    2, 
    'English', 
    'Employed', 
    'Zalando', 
    'Full-time', 
    60000, 
    80000, 
    'Berlin, Potsdam', 
    'Apartment, House', 
    'Long-term rental income',
    'Within 6 months', 
    3000, 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP);
    
    insert into 'Customer' (
    'ID', 
    'FullName', 
    'Email', 
    'HouseHoldSize', 
    'PreferredLanguage',
    'EmploymentStatus',
    'PreferredLocations',
    'PreferredPropertyTypes',
    'MaxNegativeCashFlow',
    'CreatedAt',
    'UpdatedAt')
    
    values (
    2, 
    'Anna Schiller',
    'anna.schiller@yahoo.com',
    1,
    'German',
    'Employed',
    'Hamburg',
    'Studio-Apartment',
    600,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP);

    insert into 'IncomeSource' (
        'Label',
        'MonthlyIncome',
        'CustomerID')

    values 
    ('Heinrich Salary', 8000, 1),
    ('Co-Applicant Salary', 7000, 1),
    ('Anna Salary', 4000, 2);

    insert into 'ExpenseItem' (
        'Label',
        'MonthlyExpend',
        'IsLoanPayment',
        'CustomerID')

    values
    ('Heinrich Rent', 5000, 0, 1),
    ('Heinrich Utilities', 2000, 0,1),
    ('Car Loan', 500, 1, 1),
    ('Anna Rent', 1000, 0, 2),
    ('Anna Utilities', 1500, 0, 2);

    insert into 'DocumentItem' (
        'Type',
        'Status',
        'CustomerID')

    values
    ('ID', 'REVIEWED', 1),
    ('Salary Slips', 'RECEIVED', 1),
    ('Employment Contract', 'RECEIVED', 1),
    ('Schufa Report', 'REVIEWED', 1),
    ('Tax Assessment', 'REVIEWED', 1),
    ('Existing Loan Documents', 'REVIEWED', 1),
    ('ID', 'REVIEWED', 2),
    ('Salary Slips', 'MISSING', 2),
    ('Employment Contract', 'MISSING', 2),
    ('Schufa Report', 'RECEIVED', 2),
    ('Tax Assessment', 'REQUESTED', 2),
    ('Existing Loan Documents', 'REQUESTED', 2);

    COMMIT;
  
