# Neo4j Brand Colors Mermaid Theme - Applied to All Diagrams

## Theme Configuration

All Mermaid diagrams in the `aura-fundamentals` course now use the standardized Neo4j brand colors theme.

### Theme Schema Location
- **Schema File**: `asciidoc/courses/aura-fundamentals/mermaid-theme-schema.mmd`
- **Cursor Rule**: `.cursor/rules/neo4j-mermaid-theme.mdc`

## Diagrams Updated (13 total)

### Module 1: Introduction (5 diagrams)

1. ✅ **aura-products.mmd**
   - Location: `modules/1-introduction/lessons/1-about/images/aura-products.mmd`
   - Type: Flowchart (TB)
   - Shows: Neo4j Aura platform → AuraDB/AuraDS → Tiers

2. ✅ **aura-architecture.mmd**
   - Location: `modules/1-introduction/lessons/1-about/images/aura-architecture.mmd`
   - Type: Flowchart (TB)
   - Shows: User → Aura layers → Cloud providers

3. ✅ **tier-comparison.mmd**
   - Location: `modules/1-introduction/lessons/2-tiers/images/tier-comparison.mmd`
   - Type: Graph (TB)
   - Shows: Four AuraDB tiers with features

4. ✅ **fact-check-sequence.mmd**
   - Location: `modules/1-introduction/lessons/2-tiers/images/fact-check-sequence.mmd`
   - Type: Sequence Diagram
   - Shows: Fact-checking workflow using MCP tools

5. ✅ **cost-factors.mmd**
   - Location: `modules/1-introduction/lessons/4-understand-costs/images/cost-factors.mmd`
   - Type: Flowchart (TB)
   - Shows: Cost calculation factors and optimization

### Module 2: Getting Started (5 diagrams)

6. ✅ **console-hierarchy.mmd**
   - Location: `modules/2-getting-started/lessons/1-layout-console/images/console-hierarchy.mmd`
   - Type: Flowchart (TB)
   - Shows: Organization → Projects → Instances

7. ✅ **instance-creation.mmd**
   - Location: `modules/2-getting-started/lessons/2-create-instance/images/instance-creation.mmd`
   - Type: Flowchart (TB)
   - Shows: Fixed vs. changeable settings → Provisioning → Ready

8. ✅ **instance-lifecycle.mmd**
   - Location: `modules/2-getting-started/lessons/3-manage-instance/images/instance-lifecycle.mmd`
   - Type: State Diagram
   - Shows: Instance state transitions

9. ✅ **backup-decision.mmd**
   - Location: `modules/2-getting-started/lessons/4-backup-and-restore/images/backup-decision.mmd`
   - Type: Flowchart (TD) - Decision Tree
   - Shows: Backup strategy decision flow

10. ✅ **connection-flow.mmd**
    - Location: `modules/2-getting-started/lessons/5-connecting/images/connection-flow.mmd`
    - Type: Sequence Diagram
    - Shows: Application → Driver → Load Balancer → Neo4j

### Module 3: Services & Tools (2 diagrams)

11. ✅ **import-process.mmd**
    - Location: `modules/3-services-tools/lessons/1-import/images/import-process.mmd`
    - Type: Flowchart (LR)
    - Shows: CSV → Data Importer → Neo4j Instance

12. ✅ **tool-comparison.mmd**
    - Location: `modules/3-services-tools/lessons/4-dashboard/images/tool-comparison.mmd`
    - Type: Flowchart (LR)
    - Shows: Query vs. Explore vs. Dashboards tools

### Module 4: Operations (1 diagram)

13. ✅ **shared-responsibility.mmd**
    - Location: `modules/4-operations/lessons/1-shared-responsibility/images/shared-responsibility.mmd`
    - Type: Flowchart (TB)
    - Shows: Neo4j responsibilities vs. user responsibilities

## Theme Features

### Color Palette
- **Primary Text**: `#014063` (Mid Baltic)
- **Primary Background**: `#E7FAFB` (Light Cyan)
- **Primary Border**: `#57C7E3` (Cyan)
- **Highlight**: `#00CC52` (Lime Green)
- **Teal**: `#006E58` (Teal)
- **Warning**: `#F79767` (Orange)
- **Muted**: `#485662` (Slate Gray)
- **Background**: `#FFFFFF` (White)
- **Secondary Background**: `#F5F7FA` (Light Gray)

### Typography
- **Font Family**: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif
- **Font Size**: 14px
- **Primary Text Color**: `#014063`

### Layout
- **Node Spacing**: 56px
- **Rank Spacing**: 76px
- **Padding**: 12px
- **Curve**: basis

### CSS Classes Available
- `primary` - Main containers (Light Cyan background, Cyan border)
- `highlight` - Success states (Light Cyan background, Lime Green border)
- `teal` - Data layers (Light Cyan background, Teal border)
- `warning` - Warnings (Light Gray background, Orange border)
- `muted` - Secondary info (Light Gray background, Slate border)

## Usage for New Diagrams

1. Copy the theme init block from `mermaid-theme-schema.mmd`
2. Add your diagram code below the theme configuration
3. Apply CSS classes to nodes for consistent styling
4. Regenerate PNGs using: `npm run generate:mermaid`

## Next Steps

- [ ] Regenerate all PNG files with the new theme
- [ ] Verify diagrams render correctly in the course
- [ ] Update any documentation that references diagram styling

