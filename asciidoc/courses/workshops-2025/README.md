# Modular GenAI Workshops 2025

## Overview

The 2025 Modular GenAI Workshop system provides a flexible, maintainable approach to Neo4j GenAI education. This system replaces the fragmented workshop landscape with a unified, modular approach that allows teams to mix-and-match components for customized workshop experiences.

## Key Principles

- **Modular & Maintainable**: Update once, used everywhere
- **DevRel-owned**: Each module has a clear maintainer
- **Centralized Library**: All modules live in one location for easy access
- **Consistent Experience**: Unified tone, structure, and quality
- **Flexible Delivery**: Teams can mix-and-match for any class
- **Shared Tooling**: Standardized environments, templates, and CI/CD
- **Measurable Impact**: Track usage and improve at the module level

## Module Structure

The system consists of 6 core modules that can be combined for different audiences:

### 1. Graph Basics (45 minutes)
- Fundamental graph concepts and Neo4j introduction
- Target: All audiences
- Prerequisites: None
- Key Skills: Basic Cypher, graph thinking

### 2. Structured Data (60 minutes)
- Importing and modeling structured data sources
- Target: Developers, Data Scientists
- Prerequisites: Module 1
- Key Skills: Data import, modeling, optimization

### 3. Unstructured Data (75 minutes)
- Processing text and creating knowledge graphs
- Target: All audiences
- Prerequisites: Module 2
- Key Skills: NLP, entity extraction, vector embeddings

### 4. Graph Analytics (90 minutes)
- Graph Data Science algorithms and business insights
- Target: Data Scientists, Business Analysts
- Prerequisites: Module 3
- Key Skills: GDS algorithms, feature engineering, analytics

### 5. Retrievers (75 minutes)
- RAG implementation with graph enhancement
- Target: Developers, Data Scientists
- Prerequisites: Module 4
- Key Skills: Vector search, hybrid retrieval, optimization

### 6. Agents (90 minutes)
- Intelligent agents with graph reasoning
- Target: Advanced developers, Researchers
- Prerequisites: Module 5
- Key Skills: Agent architectures, reasoning, multi-agent systems

## Toolbox Configuration

### BASIC/ADVANCED Toolbox
- **Environment**: Graph Academy / Codespaces (notebooks)
- **Dataset**: GraphRAG ebook repository datasets
- **Features**: All modules including Graph Analytics + Agentic capabilities
- **Infrastructure**: Sandbox → Aura transition

## Workshop Templates

Pre-configured combinations for different audiences:

- **Developer Workshop** (4 hours): Modules 1, 2, 5, 6
- **Data Scientist Workshop** (5 hours): Modules 1, 2, 3, 4, 5
- **Business Analyst Workshop** (3 hours): Modules 1, 3, 4, 5 (abbreviated)
- **Technical Leadership Workshop** (2.5 hours): Overview + strategic modules
- **Full Immersion Workshop** (6 hours): All modules + capstone project

See [workshop-combinations.adoc](workshop-combinations.adoc) for detailed templates.

## File Structure

```
workshops-2025/
├── README.md                           # This file
├── course.adoc                         # Main course definition
├── workshop-combinations.adoc          # Template combinations
└── modules/
    ├── 1-graph-basics/
    │   └── module.adoc
    ├── 2-structured-data/
    │   └── module.adoc
    ├── 3-unstructured-data/
    │   └── module.adoc
    ├── 4-graph-analytics/
    │   └── module.adoc
    ├── 5-retrievers/
    │   └── module.adoc
    └── 6-agents/
        └── module.adoc
```

## Implementation Timeline

- **Q2 2025**: Core module development and testing
- **July 3, 2025**: Internal enablement workshop
- **July 15, 2025**: Public launch at Graph Summit Mountain View
- **October 2025**: Full deployment and organization-wide adoption

## Getting Started

### For Workshop Instructors

1. Review the [course.adoc](course.adoc) for overall structure
2. Examine individual modules in the `modules/` directory
3. Choose appropriate combination from [workshop-combinations.adoc](workshop-combinations.adoc)
4. Set up required environments (Graph Academy, Codespaces, datasets)
5. Customize content for your specific audience

### For Content Contributors

1. Identify the relevant module for your content
2. Follow the established AsciiDoc format and structure
3. Ensure content aligns with module learning objectives
4. Test all code examples and exercises
5. Submit changes through the standard review process

### For Workshop Participants

1. Complete prerequisite modules in order
2. Set up required tools and environments
3. Download datasets from GraphRAG ebook repository
4. Participate in hands-on exercises
5. Complete assessments and provide feedback

## Technical Requirements

### Environments
- **Graph Academy**: Primary learning platform
- **GitHub Codespaces**: Development environment
- **Neo4j Sandbox**: Beginner-friendly database access
- **Neo4j Aura**: Production-ready cloud database

### Datasets
- Primary datasets from GraphRAG ebook repository
- Financial domain focus for business relevance
- Structured and unstructured data combinations
- Appropriate size for workshop timeframes

### Tools
- Neo4j Browser for graph exploration
- Python/Jupyter for data processing
- LangChain for agent development
- OpenAI API for LLM integration

## Quality Standards

### Content Standards
- Business-value focused with clear learning objectives
- Hands-on exercises that reinforce concepts
- Real-world examples and use cases
- Progressive complexity across modules
- Consistent tone and presentation style

### Technical Standards
- All code examples tested and verified
- Performance optimized for workshop environments
- Error handling and troubleshooting guidance
- Accessibility considerations for diverse audiences

### Assessment Standards
- Learning objectives clearly measured
- Practical skills demonstration
- Knowledge retention verification
- Participant satisfaction tracking

## Success Metrics

### Participant Metrics
- Workshop completion rates
- Learning objective achievement
- Practical skill demonstration
- Post-workshop application of skills
- Participant satisfaction scores

### Organizational Metrics
- Workshop delivery efficiency
- Content reuse and adaptation
- Instructor training effectiveness
- Resource utilization optimization
- Community engagement and growth

## Support and Resources

### For Instructors
- Instructor guides and training materials
- Technical setup and troubleshooting documentation
- Peer instructor community and support
- Regular content updates and improvements

### For Participants
- Pre-workshop preparation guides
- Post-workshop resources and next steps
- Community forums and discussion groups
- Certification pathways and continuing education

### For Contributors
- Content contribution guidelines
- Review and approval processes
- Version control and change management
- Recognition and attribution systems

## Future Enhancements

### Planned Features
- Interactive assessment tools
- Adaptive learning pathways
- Multilingual content support
- Advanced analytics and reporting
- Integration with enterprise learning systems

### Community Contributions
- Industry-specific modules
- Advanced technical deep-dives
- Integration with popular tools and frameworks
- Community-contributed datasets and examples

## Feedback and Contributions

We welcome feedback and contributions to improve the modular workshop system:

- **Content Issues**: Report errors or suggest improvements
- **New Modules**: Propose additional modules for specific use cases
- **Technical Improvements**: Suggest infrastructure or tooling enhancements
- **Community Content**: Share your own modules and templates

## Maintenance and Updates

### Regular Reviews
- Semi-annual content reviews and updates
- Quarterly metrics analysis and optimization
- Continuous feedback integration
- Technology and tool updates

### Version Control
- Systematic change tracking and documentation
- Backwards compatibility considerations
- Migration guides for major updates
- Archive of historical versions

## Contact Information

- **DevRel Team**: Primary owners of structure, tooling, and publishing
- **Subject Matter Experts**: Content contributors and reviewers
- **Community Managers**: Participant support and engagement
- **Technical Support**: Infrastructure and environment assistance

---

*This modular workshop system represents a new standard for Neo4j GenAI education, designed to be flexible, maintainable, and impactful across the entire organization and community.*