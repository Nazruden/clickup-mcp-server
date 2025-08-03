# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.1.1] - 2025-08-03

### Added
- New features and improvements

### Changed
- Updates and modifications

### Fixed
- Bug fixes and patches

### Security
- Security improvements


## [1.1.0] - YYYY-MM-DD

### Removed

- `clickup_delete_doc` tool and all related code (`doc.tools.ts`, `doc.service.ts`, `index.ts`, `types.ts`). This is due to the ClickUp API v3 not offering a direct `DELETE` operation for individual documents at the `/api/v3/workspaces/{workspace_id}/docs/{doc_id}` endpoint.

### Changed

- **API Migration**: Most Document management tools (`clickup_search_docs`, `clickup_create_doc`, `clickup_get_doc_pages`, `clickup_create_doc_page`, `clickup_get_doc_page_content`, `clickup_edit_doc_page_content`) have been migrated to use ClickUp API v3 endpoints. URL pathing for all service calls has been standardized to use a base URL from config with explicit `/api/v2/` or `/api/v3/` prefixes in service methods.
- **Schema Compatibility**: Refined tool input schemas for improved compatibility with Large Language Models (LLMs), notably resolving issues with Gemini 2.5 Pro. This involved changes like removing numeric enums and using specific string formatting for variable-type fields.
- **Output Standardization**: All tool handlers have been updated to return a more standardized output, typically a human-readable summary message followed by a stringified JSON object containing the detailed data.

### Fixed

- Resolved all outstanding unit test failures. All 97 unit tests across 7 test suites (covering services and tools) are now passing.
- Corrected various minor bugs identified during testing and API migration.

### Docs

- Updated `README.md` and internal memory bank documents to reflect the removal of `clickup_delete_doc`, the API version changes, and current tool capabilities.
