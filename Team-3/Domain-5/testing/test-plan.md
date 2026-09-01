# SwipeX - Test Plan

## 1. Objective

To validate the functionality, code quality, API behavior,
and integration of the SwipeX application.

## 2. Scope

Testing will cover:

- Authentication and RBAC
- Job and Swipe Service
- Resume and ATS Service
- Frontend
- API endpoints
- Local Docker Compose integration
- Regression testing

## 3. Testing Types

- Unit Testing
- API Testing
- Integration Testing
- RBAC Testing
- Regression Testing
- Code Quality Testing
- Smoke Testing

## 4. Testing Tools

### Backend
- Pytest
- Django Test Client

### Frontend
- Jest
- React Testing Library

### API
- Postman
- Pytest

### Code Quality
- Black
- Flake8
- ESLint

### Integration
- Docker Compose

## 5. Pass / Fail Criteria

### Pass
- Expected result matches actual result
- No critical defects
- Required automated tests pass
- Linting checks pass

### Fail
- Expected functionality does not work
- Critical defect is found
- Automated test fails
- Required quality check fails

## 6. Defect Management

All discovered defects will be recorded,
assigned a severity/priority, retested after fixing,
and closed only after verification.

## 7. Integration Validation

The complete application will be validated
inside the local Docker Compose environment.

## 8. Regression Testing

Previously working functionality will be retested
after changes to ensure existing features are not broken.