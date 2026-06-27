
    export type RemoteKeys = 'devtools_panel/DevtoolsWidget';
    type PackageType<T> = T extends 'devtools_panel/DevtoolsWidget' ? typeof import('devtools_panel/DevtoolsWidget') :any;